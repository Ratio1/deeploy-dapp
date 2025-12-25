import { prisma } from '@lib/prisma';
import { DraftProjectPayload } from '@lib/drafts/types';
import { buildProjectData, toProjectPayload } from '@lib/drafts/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{
        projectHash: string;
    }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { projectHash } = await context.params;

    try {
        const project = await prisma.draftProject.findUnique({
            where: { projectHash },
        });

        if (!project) {
            return NextResponse.json({ project: null });
        }

        return NextResponse.json({ project: toProjectPayload(project) });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch draft project.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request, context: RouteContext) {
    const { projectHash } = await context.params;
    let payload: DraftProjectPayload | null = null;

    try {
        payload = (await request.json()) as DraftProjectPayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!payload?.projectHash || !payload?.name || !payload?.color || !payload?.createdAt) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (payload.projectHash !== projectHash) {
        return NextResponse.json({ error: 'Project hash mismatch.' }, { status: 400 });
    }

    try {
        const project = await prisma.draftProject.update({
            where: { projectHash },
            data: buildProjectData(payload),
        });

        return NextResponse.json({ project: toProjectPayload(project) });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update draft project.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    const { projectHash } = await context.params;

    try {
        await prisma.draftProject.delete({
            where: { projectHash },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete draft project.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
