import { getStripeClient } from '@lib/cash/stripe';
import { CashCreateCheckoutPayload } from '@lib/cash/types';
import { getContainerOrWorkerType } from '@lib/deeploy-utils';
import { prisma } from '@lib/prisma';
import { toJobPayload } from '@lib/drafts/server';
import { deserializeDraftJob } from '@lib/drafts/serialization';
import { Job } from '@typedefs/deeploys';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const taxId = 'txr_1SjLr2Rl3EwF2eXLEdqjmyOI';
const applyTax = true; // TODO will depend on user's settings

const getStripePriceId = (job: Job) => {
    const containerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

    if (!containerOrWorkerType.stripePriceId) {
        throw new Error(`Missing Stripe price id for ${containerOrWorkerType.name}.`);
    }

    return containerOrWorkerType.stripePriceId;
};

const buildRedirectUrl = (origin: string, fallbackPath: string, overridePath?: string) => {
    if (overridePath) {
        return new URL(overridePath, origin);
    }

    return new URL(fallbackPath, origin);
};

class DraftJobsNotFoundError extends Error {
    constructor() {
        super('Some job drafts were not found.');
    }
}

class DraftJobsNotEditableError extends Error {
    constructor() {
        super('Some job drafts are not editable.');
    }
}

export async function POST(request: Request) {
    let payload: CashCreateCheckoutPayload | null = null;

    try {
        payload = (await request.json()) as CashCreateCheckoutPayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!payload?.projectHash || !Array.isArray(payload.jobIds)) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (payload.jobIds.length === 0) {
        return NextResponse.json({ error: 'No job ids provided.' }, { status: 400 });
    }

    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    if (!origin) {
        return NextResponse.json({ error: 'Missing request origin.' }, { status: 400 });
    }

    try {
        const { parsedJobs, jobIds } = await prisma.$transaction(async (tx) => {
            const draftJobs = await tx.job.findMany({
                where: {
                    id: { in: payload.jobIds },
                    projectHash: payload.projectHash,
                },
            });

            if (draftJobs.length !== payload.jobIds.length) {
                throw new DraftJobsNotFoundError();
            }

            const parsedJobs = draftJobs.map((job) => deserializeDraftJob(toJobPayload(job)));

            const nonDraftJobs = parsedJobs.filter((job) => job.status !== 'draft');
            if (nonDraftJobs.length > 0) {
                throw new DraftJobsNotEditableError();
            }

            const updateResult = await tx.job.updateMany({
                where: {
                    id: { in: payload.jobIds },
                    projectHash: payload.projectHash,
                    status: 'draft',
                },
                data: {
                    status: 'freezed_for_payment',
                    deployError: null,
                },
            });

            if (updateResult.count !== parsedJobs.length) {
                throw new DraftJobsNotEditableError();
            }

            return { parsedJobs, jobIds: parsedJobs.map((job) => job.id) };
        });

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = parsedJobs.map((job) => ({
            price: getStripePriceId(job),
            quantity: job.specifications.targetNodesCount,
        }));

        const refererUrl = referer ? new URL(referer) : null;
        const defaultPath = refererUrl
            ? `${refererUrl.pathname}${refererUrl.search}`
            : `/deeploys/project/${payload.projectHash}`;
        const successUrl = buildRedirectUrl(origin, defaultPath, payload.successPath);
        const cancelUrl = buildRedirectUrl(origin, defaultPath, payload.cancelPath);

        successUrl.searchParams.set('checkout', 'success');
        successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
        cancelUrl.searchParams.set('checkout', 'cancel');

        const stripe = getStripeClient();

        //TODO each job should have its own checkout session or be changed to have different subscription IDs?
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: lineItems,
            client_reference_id: payload.projectHash,
            metadata: {
                projectHash: payload.projectHash,
                draftJobIds: jobIds.join(','),
            },
            subscription_data: {
                metadata: {
                    projectHash: payload.projectHash,
                    draftJobIds: jobIds.join(','),
                },
                default_tax_rates: applyTax ? [taxId] : undefined,
            },
            success_url: successUrl.toString(),
            cancel_url: cancelUrl.toString(),
        });

        await prisma.job.updateMany({
            where: { id: { in: jobIds } },
            data: { stripeCheckoutSessionId: session.id },
        });

        return NextResponse.json({
            checkoutUrl: session.url,
            checkoutSessionId: session.id,
        });
    } catch (error) {
        if (error instanceof DraftJobsNotFoundError) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        if (error instanceof DraftJobsNotEditableError) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        const message = error instanceof Error ? error.message : 'Failed to create Stripe checkout.';

        if (payload?.jobIds?.length) {
            await prisma.job.updateMany({
                where: {
                    id: { in: payload.jobIds },
                    status: 'freezed_for_payment',
                },
                data: { status: 'draft' },
            });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
