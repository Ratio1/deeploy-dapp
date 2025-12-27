import { constructStripeEvent, getStripeClient } from '@lib/cash/stripe';
import { provisionDraftJobs } from '@lib/cash/provisioning';
import { config } from '@lib/config';
import { prisma } from '@lib/prisma';
import { toJobPayload } from '@lib/drafts/server';
import { deserializeDraftJob } from '@lib/drafts/serialization';
import { isZeroAddress } from '@lib/utils';
import type { DraftJob as DraftJobRecord } from '@prisma/client';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const parseJobIdsFromMetadata = (metadata: Stripe.Metadata | null | undefined) => {
    const raw = metadata?.draftJobIds;
    if (!raw) {
        return [] as number[];
    }

    return raw
        .split(',')
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value));
};

const getSubscriptionMetadata = async (invoice: Stripe.Invoice, subscriptionId: string) => {
    if (invoice.parent?.subscription_details?.metadata) {
        return invoice.parent.subscription_details.metadata;
    }

    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription.metadata ?? null;
};

const resolveDraftJobsByMetadata = async (
    metadata: Stripe.Metadata | null | undefined,
    subscriptionId: string,
    customerId: string | null,
) => {
    const jobIds = parseJobIdsFromMetadata(metadata);
    if (!jobIds.length) {
        return [] as DraftJobRecord[];
    }

    const projectHash = metadata?.projectHash;
    const draftJobs = await prisma.draftJob.findMany({
        where: {
            id: { in: jobIds },
            ...(projectHash ? { projectHash } : {}),
        },
    });

    if (!draftJobs.length) {
        return [] as DraftJobRecord[];
    }

    await prisma.draftJob.updateMany({
        where: { id: { in: jobIds } },
        data: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            //TODO we should also save stripeSubscriptionItemId?
        },
    });

    return draftJobs;
};

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice) => {
    const subscriptionRef =
        invoice.parent?.subscription_details?.subscription ??
        (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;

    if (!subscriptionRef) {
        return null;
    }

    return typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;
};

const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
    //TODO renewals should be handled differently, not deploy but extend
    const subscriptionId = getInvoiceSubscriptionId(invoice);
    console.log('Handling invoice.paid for subscription:', subscriptionId);

    if (!subscriptionId) {
        return;
    }

    const invoiceCustomerId = typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer?.id ?? null);
    let draftJobs: DraftJobRecord[] = await prisma.draftJob.findMany({
        where: { stripeSubscriptionId: subscriptionId },
    });
    console.log(`Found ${draftJobs.length} draft jobs for subscription ${subscriptionId}.`);

    if (!draftJobs.length) {
        const metadata = await getSubscriptionMetadata(invoice, subscriptionId);
        draftJobs = await resolveDraftJobsByMetadata(metadata, subscriptionId, invoiceCustomerId);
        console.log(`Resolved ${draftJobs.length} draft jobs from metadata for subscription ${subscriptionId}.`);

        if (!draftJobs.length) {
            return;
        }
    }

    const parsedJobs = draftJobs.map((job) => deserializeDraftJob(toJobPayload(job)));
    const eligibleJobs = parsedJobs.filter((job) => job.status === 'freezed_for_payment' || job.status === 'payment_received');

    if (!eligibleJobs.length) {
        return;
    }

    await prisma.draftJob.updateMany({
        where: {
            id: { in: eligibleJobs.map((job) => job.id) },
            status: { in: ['freezed_for_payment', 'payment_received'] },
        },
        data: {
            status: 'payment_received',
            deployError: null,
        },
    });

    const escrowContractAddress = config.escrowContractAddress;

    if (!escrowContractAddress || isZeroAddress(escrowContractAddress)) {
        throw new Error('Missing escrow contract address configuration.');
    }

    await provisionDraftJobs(eligibleJobs, escrowContractAddress);
};

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        event = constructStripeEvent(body, signature);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid Stripe signature.';
        return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
        switch (event.type) {
            // Using only invoice.paid for provisioning; re-add checkout.session.completed if metadata becomes unreliable.
            case 'invoice.paid':
                await handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;
            default:
                break;
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Webhook processing failed.';
        return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
