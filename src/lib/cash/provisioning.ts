import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { createPipeline } from '@lib/api/deeploy';
import { signDeeployPayload } from '@lib/cash/backend-wallet';
import { getCashPublicClient, getCashWalletClient } from '@lib/cash/chain';
import { getCurrentEpoch } from '@lib/config';
import {
    diffTimeFn,
    formatGenericDraftJobPayload,
    formatNativeDraftJobPayload,
    formatServiceDraftJobPayload,
    getContainerOrWorkerType,
} from '@lib/deeploy-utils';
import { prisma } from '@lib/prisma';
import { Job, JobType, ServiceJob } from '@typedefs/deeploys';
import { addDays } from 'date-fns';
import { decodeEventLog, keccak256, toBytes } from 'viem';

const getDraftJobPayload = (job: Job) => {
    switch (job.jobType) {
        case JobType.Generic:
            return formatGenericDraftJobPayload(job);
        case JobType.Native:
            return formatNativeDraftJobPayload(job);
        case JobType.Service:
            return formatServiceDraftJobPayload(job as ServiceJob);
        default:
            return {};
    }
};

const payJobsOnChain = async (jobs: Job[], escrowContractAddress: string, projectHash: string) => {
    const walletClient = getCashWalletClient();
    const publicClient = getCashPublicClient();

    const args = jobs.map((job) => {
        const containerType = getContainerOrWorkerType(job.jobType, job.specifications);
        const expiryDate = addDays(new Date(), job.costAndDuration.duration * 30);
        const durationInEpochs = diffTimeFn(expiryDate, new Date());
        const lastExecutionEpoch = BigInt(getCurrentEpoch() + durationInEpochs);
        return {
            jobType: BigInt(containerType.jobType),
            projectHash: projectHash as `0x${string}`,
            lastExecutionEpoch,
            numberOfNodesRequested: BigInt(job.specifications.targetNodesCount),
        };
    });

    const txHash = await walletClient.writeContract({
        address: escrowContractAddress as `0x${string}`,
        abi: CspEscrowAbi,
        functionName: 'createJobs',
        args: [args],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status !== 'success') {
        throw new Error('Payment failed, please try again.');
    }

    const jobCreatedLogs = receipt.logs
        .filter((log) => log.address?.toLowerCase() === escrowContractAddress.toLowerCase())
        .map((log) => {
            try {
                return decodeEventLog({
                    abi: CspEscrowAbi,
                    data: log.data,
                    topics: log.topics,
                });
            } catch (error) {
                console.error('Failed to decode log', log, error);
                return null;
            }
        })
        .filter((log) => log !== null && log.eventName === 'JobCreated');

    const jobIds = jobCreatedLogs.map((log) => log.args.jobId);

    if (jobIds.length !== jobs.length) {
        throw new Error(`Payment error: expected ${jobs.length} jobs but received ${jobIds.length} confirmations.`);
    }

    return { jobIds, txHash };
};

export const provisionDraftJobs = async (jobs: Job[], escrowContractAddress: string) => {
    if (!jobs.length) {
        return;
    }

    try {
        const project_name = 'Deeploy Cash'; //TODO to be changed with the name of the client
        const project_id = keccak256(toBytes(project_name));
        const { jobIds, txHash } = await payJobsOnChain(jobs, escrowContractAddress, project_id);

        const jobsWithIds = jobs.map((job, index) => ({
            ...job,
            runningJobId: jobIds[index],
        }));

        await prisma.$transaction(
            jobsWithIds.map((job, index) =>
                prisma.job.update({
                    where: { id: job.id },
                    data: {
                        runningJobId: jobIds[index].toString(),
                        txHash: txHash,
                        status: 'paid_on_chain',
                        deployError: null,
                    },
                }),
            ),
        );

        // wait 2 seconds before deploying
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const deployResults = await Promise.all(
            jobsWithIds.map(async (job) => {
                const project_name = 'Deeploy Cash'; //TODO to be changed with the name of the client
                const project_id = keccak256(toBytes(project_name));

                const payloadBody = {
                    ...getDraftJobPayload(job),
                    job_id: Number(job.runningJobId),
                    project_name,
                    project_id,
                };

                try {
                    const signedRequest = await signDeeployPayload(payloadBody);
                    const response = await createPipeline(signedRequest);
                    return { job, response };
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Failed to deploy job.';
                    return { job, error: message };
                }
            }),
        );

        await Promise.all(
            deployResults.map(async (result) => {
                if (
                    result.response &&
                    (result.response.status === 'success' || result.response.status === 'command_delivered')
                ) {
                    await prisma.job.update({
                        where: { id: result.job.id },
                        data: {
                            status: 'deployed',
                            deeployJobId: result.response.app_id,
                            deployError: null,
                        },
                    });
                } else {
                    const errorMessage = result.error || result.response?.error || 'Deployment failed.';
                    await prisma.job.update({
                        where: { id: result.job.id },
                        data: {
                            status: 'deploy_failed',
                            deployError: errorMessage,
                        },
                    });
                }
            }),
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process payment.';

        await prisma.job.updateMany({
            where: { id: { in: jobs.map((job) => job.id) } },
            data: {
                status: 'deploy_failed',
                deployError: message,
            },
        });

        throw error;
    }
};
