import type { DraftJob as DraftJobRecord, DraftProject as DraftProjectRecord } from '@prisma/client';
import type { DraftJobPayload, DraftProjectPayload } from './types';

const getDetails = <T>(details: DraftJobRecord['details']): T => {
    if (details && typeof details === 'object' && !Array.isArray(details)) {
        return details as T;
    }
    return {} as T;
};

export const toProjectPayload = (record: DraftProjectRecord): DraftProjectPayload => {
    return {
        projectHash: record.projectHash,
        name: record.name,
        color: record.color,
        createdAt: record.createdAt.toISOString(),
    };
};

export const toJobPayload = (record: DraftJobRecord): DraftJobPayload => {
    const details = getDetails<DraftJobPayload>(record.details);
    const payload: DraftJobPayload = {
        ...details,
        id: record.id,
        projectHash: record.projectHash,
        jobType: record.jobType as DraftJobPayload['jobType'],
        paid: record.paid,
        name: record.name ?? details.name,
        ...(record.runningJobId ? { runningJobId: record.runningJobId } : {}),
    };

    if (!payload.paid) {
        delete payload.runningJobId;
    }

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
        paid: payload.paid,
        runningJobId: payload.paid ? payload.runningJobId ?? null : null,
        details: { ...payload, name },
    };
};
