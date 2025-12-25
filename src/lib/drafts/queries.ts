import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DraftJob, DraftProject } from '@typedefs/deeploys';
import {
    createDraftJob,
    createDraftProject,
    deleteDraftJob,
    deleteDraftProject,
    getDraftJob,
    getDraftJobs,
    getDraftProject,
    getDraftProjects,
    updateDraftJob,
    updateDraftProject,
} from './api';
import { DraftJobCreatePayload, DraftProjectCreatePayload } from './types';

export const draftQueryKeys = {
    projects: () => ['draft-projects'] as const,
    project: (projectHash: string) => ['draft-project', projectHash] as const,
    jobs: (projectHash?: string) => ['draft-jobs', projectHash ?? 'all'] as const,
    job: (id: number) => ['draft-job', id] as const,
};

export const useDraftProjects = () =>
    useQuery({
        queryKey: draftQueryKeys.projects(),
        queryFn: getDraftProjects,
    });

export const useDraftProject = (projectHash?: string, enabled = true) =>
    useQuery({
        queryKey: projectHash ? draftQueryKeys.project(projectHash) : draftQueryKeys.project('unknown'),
        queryFn: () => getDraftProject(projectHash as string),
        enabled: !!projectHash && enabled,
    });

export const useDraftJobs = (projectHash?: string, enabled = true) =>
    useQuery({
        queryKey: draftQueryKeys.jobs(projectHash),
        queryFn: () => getDraftJobs(projectHash),
        enabled,
    });

export const useDraftJob = (id?: number, enabled = true) =>
    useQuery({
        queryKey: id !== undefined ? draftQueryKeys.job(id) : draftQueryKeys.job(-1),
        queryFn: () => getDraftJob(id as number),
        enabled: typeof id === 'number' && enabled,
    });

export const useCreateDraftProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: DraftProjectCreatePayload) => createDraftProject(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.projects() });
        },
    });
};

export const useUpdateDraftProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectHash, payload }: { projectHash: string; payload: DraftProject }) =>
            updateDraftProject(projectHash, payload),
        onSuccess: (project) => {
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.projects() });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.project(project.projectHash) });
        },
    });
};

export const useDeleteDraftProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectHash: string) => deleteDraftProject(projectHash),
        onSuccess: (_data, projectHash) => {
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.projects() });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.project(projectHash) });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs(projectHash) });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs() });
        },
    });
};

export const useCreateDraftJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: DraftJobCreatePayload) => createDraftJob(payload),
        onSuccess: (job) => {
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs(job.projectHash) });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs() });
        },
    });
};

export const useUpdateDraftJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: DraftJob }) => updateDraftJob(id, payload),
        onSuccess: (job) => {
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.job(job.id) });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs(job.projectHash) });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs() });
        },
    });
};

export const useDeleteDraftJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, projectHash }: { id: number; projectHash: string }) => deleteDraftJob(id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.job(variables.id) });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs(variables.projectHash) });
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs() });
        },
    });
};
