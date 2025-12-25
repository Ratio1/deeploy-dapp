import { prisma } from '@lib/prisma';
import { DraftProjectPayload } from '@lib/drafts/types';
import { buildProjectData, toProjectPayload } from '@lib/drafts/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const projects = await prisma.draftProject.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            projects: projects.map((project) => toProjectPayload(project)),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch draft projects.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let payload: DraftProjectPayload | null = null;

    try {
        payload = (await request.json()) as DraftProjectPayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!payload?.projectHash || !payload?.name || !payload?.color || !payload?.createdAt) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    try {
        const project = await prisma.draftProject.create({
            data: buildProjectData(payload),
        });

        return NextResponse.json({ project: toProjectPayload(project) }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create draft project.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
