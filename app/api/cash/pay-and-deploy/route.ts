import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { createPipeline } from '@lib/api/deeploy';
import { signDeeployPayload } from '@lib/cash/backend-wallet';
import { getCashPublicClient, getCashWalletClient } from '@lib/cash/chain';
import { CashDraftJob, CashPayAndDeployPayload, CashPayAndDeployResponse } from '@lib/cash/types';
import {
    diffTimeFn,
    formatGenericDraftJobPayload,
    formatNativeDraftJobPayload,
    formatServiceDraftJobPayload,
    getContainerOrWorkerType,
} from '@lib/deeploy-utils';
import { DraftJob, GenericDraftJob, JobType, NativeDraftJob, PaidDraftJob, ServiceDraftJob } from '@typedefs/deeploys';
import { addDays } from 'date-fns';
import { decodeEventLog } from 'viem';
import { NextResponse } from 'next/server';
import { getCurrentEpoch } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const parseCashDraftJob = (job: CashDraftJob): DraftJob => {
    if (job.paid) {
        if (!job.runningJobId) {
            throw new Error('Missing runningJobId for paid job.');
        }
        return {
            ...job,
            runningJobId: BigInt(job.runningJobId),
        } as DraftJob;
    }

    return job as DraftJob;
};

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

    if (!payload?.projectHash || !payload?.escrowContractAddress || !Array.isArray(payload.jobs)) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    try {
        const parsedJobs = payload.jobs.map((job) => parseCashDraftJob(job));
        const unpaidJobs = parsedJobs.filter((job) => !job.paid);

        let paidJobs: PaidDraftJob[] = parsedJobs.filter((job) => job.paid) as PaidDraftJob[];

        if (unpaidJobs.length > 0) {
            const jobIds = await payUnpaidJobs(unpaidJobs, payload.escrowContractAddress, payload.projectHash);
            let jobIndex = 0;

            const updatedJobs = parsedJobs.map((job) => {
                if (job.paid) {
                    return job;
                }

                const jobId = jobIds[jobIndex++];
                return {
                    ...job,
                    paid: true,
                    runningJobId: jobId,
                } as PaidDraftJob;
            });

            paidJobs = updatedJobs as PaidDraftJob[];
        }

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

        return NextResponse.json(responseBody);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error while paying and deploying.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
