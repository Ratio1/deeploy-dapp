import { prisma } from '@lib/prisma';
import { DraftJobCreatePayload, DraftJobPayload } from '@lib/drafts/types';
import { buildJobData, toJobPayload } from '@lib/drafts/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectHash = searchParams.get('projectHash') ?? undefined;

    try {
        const jobs = await prisma.job.findMany({
            where: {
                status: { not: 'deployed' },
                ...(projectHash ? { projectHash } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            jobs: jobs.map(toJobPayload),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch draft jobs.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let payload: DraftJobCreatePayload | null = null;

    try {
        payload = (await request.json()) as DraftJobCreatePayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!payload?.projectHash || !payload?.jobType) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    try {
        const job = await prisma.job.create({
            data: buildJobData({ ...(payload as DraftJobPayload), status: 'draft' }),
        });

        return NextResponse.json({ job: toJobPayload(job) }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create draft job.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
