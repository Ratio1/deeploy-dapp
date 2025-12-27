import { Job, Project } from '@typedefs/deeploys';
import { toApiError } from '@lib/api/apiError';
import axios from 'axios';
import { deserializeDraftJob, deserializeDraftJobs, serializeDraftJob } from './serialization';
import {
    DraftJobCreatePayload,
    DraftJobResponse,
    DraftJobsResponse,
    DraftProjectCreatePayload,
    DraftProjectResponse,
    DraftProjectsResponse,
} from './types';

const axiosDrafts = axios.create({
    baseURL: '/api/drafts',
});

const request = async <T>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> => {
    try {
        const { data } = await axiosDrafts.request<T>({
            url: `/${path}`,
            method,
            data: body,
        });

        return data;
    } catch (error) {
        const parsed = toApiError(error, 'Failed to communicate with drafts API.');
        throw new Error(parsed.message);
    }
};

export const getDraftProjects = async (): Promise<Project[]> => {
    const data = await request<DraftProjectsResponse>('projects', 'GET');
    return data.projects;
};

export const getDraftProject = async (projectHash: string): Promise<Project | null> => {
    const data = await request<DraftProjectResponse>(`projects/${projectHash}`, 'GET');
    return data.project;
};

export const createDraftProject = async (payload: DraftProjectCreatePayload): Promise<Project> => {
    const data = await request<DraftProjectResponse>('projects', 'POST', payload);

    if (!data.project) {
        throw new Error('Failed to create project draft.');
    }

    return data.project;
};

export const updateDraftProject = async (projectHash: string, payload: Project): Promise<Project> => {
    const data = await request<DraftProjectResponse>(`projects/${projectHash}`, 'PUT', payload);

    if (!data.project) {
        throw new Error('Failed to update project draft.');
    }

    return data.project;
};

export const deleteDraftProject = async (projectHash: string): Promise<void> => {
    await request<{ ok: true }>(`projects/${projectHash}`, 'DELETE');
};

export const getDraftJobs = async (projectHash?: string): Promise<Job[]> => {
    const query = projectHash ? `?projectHash=${encodeURIComponent(projectHash)}` : '';
    const data = await request<DraftJobsResponse>(`jobs${query}`, 'GET');
    return deserializeDraftJobs(data.jobs);
};

export const getDraftJob = async (id: number): Promise<Job | null> => {
    const data = await request<DraftJobResponse>(`jobs/${id}`, 'GET');
    return data.job ? deserializeDraftJob(data.job) : null;
};

export const createDraftJob = async (payload: DraftJobCreatePayload): Promise<Job> => {
    const data = await request<DraftJobResponse>('jobs', 'POST', payload);

    if (!data.job) {
        throw new Error('Failed to create job draft.');
    }

    return deserializeDraftJob(data.job);
};

export const updateDraftJob = async (id: number, payload: Job): Promise<Job> => {
    const serialized = serializeDraftJob(payload);
    const data = await request<DraftJobResponse>(`jobs/${id}`, 'PUT', serialized);

    if (!data.job) {
        throw new Error('Failed to update job draft.');
    }

    return deserializeDraftJob(data.job);
};

export const deleteDraftJob = async (id: number): Promise<void> => {
    await request<{ ok: true }>(`jobs/${id}`, 'DELETE');
};
