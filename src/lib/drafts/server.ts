import type { Job as JobRecord, Project as ProjectRecord } from '@prisma-generated/client';
import type { DraftJobPayload, DraftProjectPayload } from './types';

const getDetails = <T>(details: JobRecord['details']): T => {
    if (details && typeof details === 'object' && !Array.isArray(details)) {
        return details as T;
    }
    return {} as T;
};

export const toProjectPayload = (record: ProjectRecord): DraftProjectPayload => {
    return {
        projectHash: record.projectHash,
        name: record.name,
        color: record.color,
        createdAt: record.createdAt.toISOString(),
    };
};

export const toJobPayload = (record: JobRecord): DraftJobPayload => {
    const details = getDetails<DraftJobPayload>(record.details);
    const payload: DraftJobPayload = {
        ...details,
        id: record.id,
        projectHash: record.projectHash,
        jobType: record.jobType as DraftJobPayload['jobType'],
        status: record.status as DraftJobPayload['status'],
        name: record.name ?? details.name,
        ...(record.jobId !== null ? { jobId: record.jobId } : {}),
        ...(record.stripeSubscriptionId ? { stripeSubscriptionId: record.stripeSubscriptionId } : {}),
        ...(record.stripeSubscriptionItemId ? { stripeSubscriptionItemId: record.stripeSubscriptionItemId } : {}),
        ...(record.stripeCheckoutSessionId ? { stripeCheckoutSessionId: record.stripeCheckoutSessionId } : {}),
        ...(record.stripeCustomerId ? { stripeCustomerId: record.stripeCustomerId } : {}),
        ...(record.txHash ? { txHash: record.txHash } : {}),
        ...(record.deeployJobName ? { deeployJobName: record.deeployJobName } : {}),
        ...(record.deployError ? { deployError: record.deployError } : {}),
    };

    return payload;
};

export const buildProjectData = (payload: DraftProjectPayload) => {
    return {
        projectHash: payload.projectHash,
        name: payload.name,
        color: payload.color,
        createdAt: new Date(payload.createdAt),
    };
};

export const buildJobData = (payload: DraftJobPayload, projectHashOverride?: string) => {
    const name = payload.name ?? payload.deployment?.jobAlias ?? 'Untitled Job';
    return {
        projectHash: projectHashOverride ?? payload.projectHash,
        name,
        jobType: payload.jobType,
        status: payload.status ?? 'draft',
        jobId: payload.jobId ?? null,
        stripeSubscriptionId: payload.stripeSubscriptionId ?? null,
        stripeSubscriptionItemId: payload.stripeSubscriptionItemId ?? null,
        stripeCheckoutSessionId: payload.stripeCheckoutSessionId ?? null,
        stripeCustomerId: payload.stripeCustomerId ?? null,
        txHash: payload.txHash ?? null,
        deeployJobName: payload.deeployJobName ?? null,
        deployError: payload.deployError ?? null,
        details: { ...payload, name },
    };
};
