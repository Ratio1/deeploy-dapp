import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { updatePipeline } from '@lib/api/deeploy';
import { signDeeployPayload } from '@lib/cash/backend-wallet';
import { getCashPublicClient } from '@lib/cash/chain';
import { deeployCashProjectId } from '@lib/cash/provisioning';
import { CashUpdateJobPayload } from '@lib/cash/types';
import { config } from '@lib/config';
import {
    formatGenericJobPayload,
    formatNativeJobPayload,
    formatServiceJobPayload,
    getContainerOrWorkerType,
} from '@lib/deeploy-utils';
import { buildJobData, toJobPayload } from '@lib/drafts/server';
import { prisma } from '@lib/prisma';
import { jobSchema } from '@schemas/index';
import {
    GenericJobSpecifications,
    JobSpecifications,
    JobType,
    NativeJobSpecifications,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import services from '@data/services';
import { isZeroAddress } from '@lib/utils';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resolveCurrentTargetNodesCount = async (jobId: number, existingCount?: number) => {
    if (typeof existingCount === 'number' && Number.isFinite(existingCount)) {
        return existingCount;
    }

    const escrowContractAddress = config.escrowContractAddress;

    if (!escrowContractAddress || isZeroAddress(escrowContractAddress)) {
        throw new Error('Missing escrow contract address configuration.');
    }

    const publicClient = getCashPublicClient();
    const runningJob = await publicClient.readContract({
        address: escrowContractAddress as `0x${string}`,
        abi: CspEscrowAbi,
        functionName: 'getJobDetails',
        args: [BigInt(jobId)],
    });

    const count = Number(runningJob.numberOfNodesRequested);
    if (!Number.isFinite(count)) {
        throw new Error('Invalid target nodes count.');
    }

    return count;
};

export async function POST(request: Request) {
    let payload: CashUpdateJobPayload | null = null;

    try {
        payload = (await request.json()) as CashUpdateJobPayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (payload?.jobId === undefined || !payload.job) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const parsedJob = jobSchema.safeParse(payload.job);
    if (!parsedJob.success) {
        return NextResponse.json({ error: 'Invalid job data.' }, { status: 400 });
    }

    const jobId = payload.jobId;
    if (!Number.isSafeInteger(jobId)) {
        return NextResponse.json({ error: 'Invalid job id.' }, { status: 400 });
    }

    try {
        const jobRecord = await prisma.job.findFirst({
            where: {
                jobId: jobId,
                ...(payload.projectHash ? { projectHash: payload.projectHash } : {}),
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!jobRecord) {
            return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
        }

        const existingPayload = toJobPayload(jobRecord);
        if (existingPayload.jobType !== parsedJob.data.jobType) {
            return NextResponse.json({ error: 'Job type mismatch.' }, { status: 409 });
        }

        const currentTargetNodesCount = await resolveCurrentTargetNodesCount(
            jobId,
            existingPayload.specifications?.targetNodesCount,
        );

        if (parsedJob.data.specifications.targetNodesCount > currentTargetNodesCount) {
            return NextResponse.json({ error: 'Cost-increasing updates are not supported yet.' }, { status: 409 });
        }

        const specificationsWithType = {
            ...parsedJob.data.specifications,
            type: parsedJob.data.jobType,
        } as JobSpecifications;
        const containerOrWorkerType = getContainerOrWorkerType(parsedJob.data.jobType, specificationsWithType);

        let deeployPayload: Record<string, any> = {};

        switch (parsedJob.data.jobType) {
            case JobType.Generic: {
                const specifications = {
                    ...parsedJob.data.specifications,
                    type: JobType.Generic,
                } as GenericJobSpecifications;

                deeployPayload = formatGenericJobPayload(containerOrWorkerType, specifications, parsedJob.data.deployment);
                break;
            }
            case JobType.Native: {
                const specifications = {
                    ...parsedJob.data.specifications,
                    type: JobType.Native,
                } as NativeJobSpecifications;

                deeployPayload = formatNativeJobPayload(containerOrWorkerType, specifications, {
                    ...parsedJob.data.deployment,
                    plugins: parsedJob.data.plugins,
                });
                break;
            }
            case JobType.Service: {
                const serviceId = (parsedJob.data as { serviceId: number }).serviceId;
                const service = services.find((serviceItem) => serviceItem.id === serviceId);

                if (!service) {
                    return NextResponse.json({ error: 'Invalid service selection.' }, { status: 400 });
                }

                const specifications = {
                    ...parsedJob.data.specifications,
                    type: JobType.Service,
                } as ServiceJobSpecifications;

                deeployPayload = formatServiceJobPayload(
                    containerOrWorkerType,
                    service,
                    specifications,
                    parsedJob.data.deployment,
                );
                break;
            }
            default:
                return NextResponse.json({ error: 'Unknown job type.' }, { status: 400 });
        }

        const appId = existingPayload.deeployJobName ?? existingPayload.deployment?.jobAlias;

        if (!appId) {
            return NextResponse.json({ error: 'Missing Deeploy app id.' }, { status: 500 });
        }

        const requestPayload = {
            ...deeployPayload,
            app_id: appId,
            job_id: jobId,
            project_id: deeployCashProjectId,
            ...(jobRecord.project?.name ? { project_name: jobRecord.project.name } : {}),
        };
        const signedRequest = await signDeeployPayload(requestPayload);
        const updateResponse = await updatePipeline(signedRequest);

        const isSuccess = updateResponse.status === 'success' || updateResponse.status === 'command_delivered';

        if (isSuccess) {
            const updatedPayload = {
                ...existingPayload,
                jobType: parsedJob.data.jobType,
                specifications: specificationsWithType,
                costAndDuration: parsedJob.data.costAndDuration,
                deployment: parsedJob.data.deployment,
                name: parsedJob.data.deployment.jobAlias,
                deeployJobName: updateResponse.app_id ?? existingPayload.deeployJobName,
                deployError: undefined,
                ...(parsedJob.data.jobType === JobType.Native ? { plugins: parsedJob.data.plugins } : {}),
                ...(parsedJob.data.jobType === JobType.Service
                    ? { serviceId: parsedJob.data.serviceId, tunnelURL: parsedJob.data.tunnelURL }
                    : {}),
            };

            await prisma.job.update({
                where: { id: jobRecord.id },
                data: buildJobData(updatedPayload, existingPayload.projectHash),
            });
        }

        return NextResponse.json(updateResponse);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update job.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
