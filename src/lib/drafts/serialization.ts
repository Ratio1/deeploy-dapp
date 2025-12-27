import { Job } from '@typedefs/deeploys';
import { DraftJobPayload } from './types';

export const serializeDraftJob = (job: Job): DraftJobPayload => {
    const payload = { ...job } as DraftJobPayload;
    payload.name = job.deployment?.jobAlias ?? payload.name;

    if (job.runningJobId) {
        payload.runningJobId = job.runningJobId.toString();
    } else {
        delete payload.runningJobId;
    }

    return payload;
};

export const serializeDraftJobs = (jobs: Job[]): DraftJobPayload[] => jobs.map(serializeDraftJob);

export const deserializeDraftJob = (job: DraftJobPayload): Job => {
    if (job.runningJobId) {
        return {
            ...job,
            runningJobId: BigInt(job.runningJobId),
        } as Job;
    }

    return job as Job;
};

export const deserializeDraftJobs = (jobs: DraftJobPayload[]): Job[] => jobs.map(deserializeDraftJob);
