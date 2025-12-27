import { DraftJob } from '@typedefs/deeploys';
import { DraftJobPayload } from './types';

export const serializeDraftJob = (job: DraftJob): DraftJobPayload => {
    const payload = { ...job } as DraftJobPayload;
    payload.name = job.deployment?.jobAlias ?? payload.name;

    if (job.runningJobId) {
        payload.runningJobId = job.runningJobId.toString();
    } else {
        delete payload.runningJobId;
    }

    return payload;
};

export const serializeDraftJobs = (jobs: DraftJob[]): DraftJobPayload[] => jobs.map(serializeDraftJob);

export const deserializeDraftJob = (job: DraftJobPayload): DraftJob => {
    if (job.runningJobId) {
        return {
            ...job,
            runningJobId: BigInt(job.runningJobId),
        } as DraftJob;
    }

    return job as DraftJob;
};

export const deserializeDraftJobs = (jobs: DraftJobPayload[]): DraftJob[] => jobs.map(deserializeDraftJob);
