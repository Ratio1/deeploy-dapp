import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { createPipeline } from '@lib/api/deeploy';
import { signDeeployPayload } from '@lib/cash/backend-wallet';
import { getCashPublicClient, getCashWalletClient } from '@lib/cash/chain';
import { CashPayAndDeployPayload, CashPayAndDeployResponse } from '@lib/cash/types';
import { config, getCurrentEpoch } from '@lib/config';
import {
    diffTimeFn,
    formatGenericDraftJobPayload,
    formatNativeDraftJobPayload,
    formatServiceDraftJobPayload,
    getContainerOrWorkerType,
} from '@lib/deeploy-utils';
import { prisma } from '@lib/prisma';
import { toJobPayload } from '@lib/drafts/server';
import { deserializeDraftJob } from '@lib/drafts/serialization';
import { isZeroAddress } from '@lib/utils';
import { DraftJob, GenericDraftJob, JobType, NativeDraftJob, PaidDraftJob, ServiceDraftJob } from '@typedefs/deeploys';
import { addDays } from 'date-fns';
import { decodeEventLog } from 'viem';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getDraftJobPayload = (job: DraftJob) => {
    switch (job.jobType) {
        case JobType.Generic:
            return formatGenericDraftJobPayload(job as GenericDraftJob);
        case JobType.Native:
            return formatNativeDraftJobPayload(job as NativeDraftJob);
        case JobType.Service:
            return formatServiceDraftJobPayload(job as ServiceDraftJob);
        default:
            return {};
    }
};

const payUnpaidJobs = async (unpaidJobs: DraftJob[], escrowContractAddress: string, projectHash: string) => {
    const walletClient = getCashWalletClient();
    const publicClient = getCashPublicClient();

    const args = unpaidJobs.map((job) => {
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

    if (jobIds.length !== unpaidJobs.length) {
        throw new Error(`Payment error: expected ${unpaidJobs.length} jobs but received ${jobIds.length} confirmations.`);
    }

    return jobIds;
};

export async function POST(request: Request) {
    let payload: CashPayAndDeployPayload | null = null;

    try {
        payload = (await request.json()) as CashPayAndDeployPayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!payload?.projectHash || !Array.isArray(payload.jobIds)) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    try {
        const escrowContractAddress = config.escrowContractAddress;

        if (!escrowContractAddress || isZeroAddress(escrowContractAddress)) {
            return NextResponse.json({ error: 'Missing escrow contract address configuration.' }, { status: 500 });
        }

        if (payload.jobIds.length === 0) {
            return NextResponse.json({ error: 'No job ids provided.' }, { status: 400 });
        }

        const draftJobs = await prisma.draftJob.findMany({
            where: {
                id: { in: payload.jobIds },
                projectHash: payload.projectHash,
            },
        });

        if (draftJobs.length !== payload.jobIds.length) {
            return NextResponse.json({ error: 'Some job drafts were not found.' }, { status: 404 });
        }

        const parsedJobs = draftJobs.map((job) => deserializeDraftJob(toJobPayload(job)));
        const unpaidJobs = parsedJobs.filter((job) => !job.paid);

        let paidJobs: PaidDraftJob[] = parsedJobs.filter((job) => job.paid) as PaidDraftJob[];
        const newlyPaidAssignments: { id: number; runningJobId: bigint }[] = [];

        if (unpaidJobs.length > 0) {
            const jobIds = await payUnpaidJobs(unpaidJobs, escrowContractAddress, payload.projectHash);
            let jobIndex = 0;

            const updatedJobs = parsedJobs.map((job) => {
                if (job.paid) {
                    return job;
                }

                const jobId = jobIds[jobIndex++];
                newlyPaidAssignments.push({ id: job.id, runningJobId: jobId });
                return {
                    ...job,
                    paid: true,
                    runningJobId: jobId,
                } as PaidDraftJob;
            });

            paidJobs = updatedJobs as PaidDraftJob[];
        }

        if (newlyPaidAssignments.length > 0) {
            await Promise.all(
                newlyPaidAssignments.map(({ id, runningJobId }) =>
                    prisma.draftJob.update({
                        where: { id },
                        data: {
                            paid: true,
                            runningJobId: runningJobId.toString(),
                        },
                    }),
                ),
            );
        }

        //wait 2 seconds to ensure blockchain finality
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const results = await Promise.all(
            paidJobs.map(async (job) => {
                const draftJobId = job.id;
                const runningJobId = job.runningJobId.toString();
                const payloadBody = {
                    ...getDraftJobPayload(job),
                    job_id: Number(job.runningJobId),
                    project_id: payload.projectHash,
                    ...(payload.projectName ? { project_name: payload.projectName } : {}),
                };

                try {
                    const signedRequest = await signDeeployPayload(payloadBody);
                    const response = await createPipeline(signedRequest);
                    return { draftJobId, runningJobId, response };
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Failed to deploy job.';
                    return { draftJobId, runningJobId, error: message };
                }
            }),
        );

        const responseBody: CashPayAndDeployResponse = {
            results,
        };

        const successfulJobIds = results
            .filter((result) => result.response?.status === 'success' || result.response?.status === 'command_delivered')
            .map((result) => result.draftJobId);

        if (successfulJobIds.length > 0) {
            await prisma.draftJob.deleteMany({
                where: {
                    id: { in: successfulJobIds },
                    projectHash: payload.projectHash,
                },
            });
        }

        if (successfulJobIds.length === paidJobs.length) {
            await prisma.draftProject.delete({
                where: { projectHash: payload.projectHash },
            });
        }

        return NextResponse.json(responseBody);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error while paying and deploying.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
