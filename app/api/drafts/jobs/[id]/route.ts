import { prisma } from '@lib/prisma';
import { DraftJobPayload } from '@lib/drafts/types';
import { buildJobData, toJobPayload } from '@lib/drafts/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

const parseId = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

export async function GET(_request: Request, context: RouteContext) {
    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (id === null) {
        return NextResponse.json({ error: 'Invalid draft job id.' }, { status: 400 });
    }

    try {
        const job = await prisma.job.findUnique({
            where: { id },
        });

        if (!job || job.status === 'deployed') {
            return NextResponse.json({ job: null });
        }

        return NextResponse.json({ job: toJobPayload(job) });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch draft job.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request, context: RouteContext) {
    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (id === null) {
        return NextResponse.json({ error: 'Invalid draft job id.' }, { status: 400 });
    }

    let payload: DraftJobPayload | null = null;

    try {
        payload = (await request.json()) as DraftJobPayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!payload?.projectHash || !payload?.jobType) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (payload.id && payload.id !== id) {
        return NextResponse.json({ error: 'Job id mismatch.' }, { status: 400 });
    }

    try {
        const existingJob = await prisma.job.findUnique({ where: { id } });

        if (!existingJob) {
            return NextResponse.json({ job: null }, { status: 404 });
        }

        if (existingJob.status !== 'draft') {
            return NextResponse.json({ error: 'Draft job is not editable.' }, { status: 409 });
        }

        if (payload.status && payload.status !== 'draft') {
            return NextResponse.json({ error: 'Draft job status cannot be changed from this endpoint.' }, { status: 409 });
        }

        const job = await prisma.job.update({
            where: { id },
            data: buildJobData({ ...payload, status: 'draft' }, payload.projectHash),
        });

        return NextResponse.json({ job: toJobPayload(job) });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update draft job.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (id === null) {
        return NextResponse.json({ error: 'Invalid draft job id.' }, { status: 400 });
    }

    try {
        const existingJob = await prisma.job.findUnique({ where: { id } });

        if (!existingJob) {
            return NextResponse.json({ ok: true });
        }

        if (existingJob.status !== 'draft') {
            return NextResponse.json({ error: 'Draft job is not deletable.' }, { status: 409 });
        }

        await prisma.job.delete({ where: { id } });

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete draft job.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
