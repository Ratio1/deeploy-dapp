import { DraftJob, DraftProject } from '@typedefs/deeploys';

export type DraftProjectPayload = DraftProject;
export type DraftProjectCreatePayload = DraftProject;

export type DraftJobPayload = Omit<DraftJob, 'runningJobId'> & {
    runningJobId?: string;
    name?: string;
};

export type DraftJobCreatePayload = Omit<DraftJobPayload, 'id'>;

export type DraftProjectsResponse = {
    projects: DraftProjectPayload[];
};

export type DraftProjectResponse = {
    project: DraftProjectPayload | null;
};

export type DraftJobsResponse = {
    jobs: DraftJobPayload[];
};

export type DraftJobResponse = {
    job: DraftJobPayload | null;
};
