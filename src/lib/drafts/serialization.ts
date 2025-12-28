import { Job } from '@typedefs/deeploys';
import { DraftJobPayload } from './types';

export const serializeDraftJob = (job: Job): DraftJobPayload => {
    const payload = { ...job } as DraftJobPayload;
    payload.name = job.deployment?.jobAlias ?? payload.name;

    if (job.jobId !== undefined) {
        payload.jobId = job.jobId;
    } else {
        delete payload.jobId;
    }

    return payload;
};

export const serializeDraftJobs = (jobs: Job[]): DraftJobPayload[] => jobs.map(serializeDraftJob);

export const deserializeDraftJob = (job: DraftJobPayload): Job => {
    return job as Job;
};

export const deserializeDraftJobs = (jobs: DraftJobPayload[]): Job[] => jobs.map(deserializeDraftJob);
