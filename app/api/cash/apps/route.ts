import { getApps } from '@lib/api/deeploy';
import { signAndBuildDeeployRequest } from '@lib/cash/backend-wallet';
import { prisma } from '@lib/prisma';
import { Apps } from '@typedefs/deeployApi';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const mapAppsToProjectDetails = async (apps: Apps): Promise<Apps> => {
    const jobIds = Object.values(apps)
        .flatMap((nodeApps) => Object.values(nodeApps))
        .map((app) => app.deeploy_specs.job_id)
        .filter((jobId) => Number.isFinite(jobId));

    if (jobIds.length === 0) {
        return apps;
    }

    const uniqueJobIds = Array.from(new Set(jobIds.map((jobId) => jobId.toString())));

    const jobs = await prisma.job.findMany({
        where: {
            runningJobId: { in: uniqueJobIds },
        },
        select: {
            runningJobId: true,
            projectHash: true,
            project: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (jobs.length === 0) {
        return apps;
    }

    const projectByRunningJobId = new Map<string, { projectHash: string; projectName: string }>();

    jobs.forEach((job) => {
        if (!job.runningJobId || !job.project?.name) {
            return;
        }

        projectByRunningJobId.set(job.runningJobId, {
            projectHash: job.projectHash,
            projectName: job.project.name,
        });
    });

    if (projectByRunningJobId.size === 0) {
        return apps;
    }

    const mappedApps: Apps = {};

    Object.entries(apps).forEach(([nodeAddress, nodeApps]) => {
        const mappedNodeApps: Record<string, any> = {};

        Object.entries(nodeApps).forEach(([alias, app]) => {
            const jobId = app.deeploy_specs.job_id;
            const mapping = projectByRunningJobId.get(jobId.toString());

            if (!mapping) {
                mappedNodeApps[alias] = app;
                return;
            }

            mappedNodeApps[alias] = {
                ...app,
                deeploy_specs: {
                    ...app.deeploy_specs,
                    project_id: mapping.projectHash,
                    project_name: mapping.projectName || app.deeploy_specs.project_name,
                },
            };
        });

        mappedApps[nodeAddress as keyof Apps] = mappedNodeApps as Apps[keyof Apps];
    });

    return mappedApps;
};

export async function GET() {
    try {
        const request = await signAndBuildDeeployRequest();
        const response = await getApps(request);

        if (!response.apps || response.status === 'fail') {
            const message = response.error ?? 'Failed to fetch apps from Deeploy.';
            return NextResponse.json({ error: message }, { status: 502 });
        }

        const apps = await mapAppsToProjectDetails(response.apps);
        return NextResponse.json({ apps });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error while fetching apps.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
