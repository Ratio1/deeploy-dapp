import { Job, Project } from '@typedefs/deeploys';

export type DraftProjectPayload = Project;
export type DraftProjectCreatePayload = Project;

export type DraftJobPayload = Omit<Job, 'jobId'> & {
    jobId?: number;
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
