import Stripe from 'stripe';

const STRIPE_SECRET_KEY_ENV = 'STRIPE_SECRET_KEY';
const STRIPE_WEBHOOK_SECRET_ENV = 'STRIPE_WEBHOOK_SECRET';

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
    if (!stripeClient) {
        const secretKey = process.env[STRIPE_SECRET_KEY_ENV];

        if (!secretKey) {
            throw new Error(`Missing ${STRIPE_SECRET_KEY_ENV} env var.`);
        }

        stripeClient = new Stripe(secretKey, {
            apiVersion: '2025-12-15.clover',
            typescript: true,
        });
    }

    return stripeClient;
};

export const getStripeWebhookSecret = () => {
    const secret = process.env[STRIPE_WEBHOOK_SECRET_ENV];

    if (!secret) {
        throw new Error(`Missing ${STRIPE_WEBHOOK_SECRET_ENV} env var.`);
    }

    return secret;
};

export const constructStripeEvent = (payload: string, signature: string | null) => {
    if (!signature) {
        throw new Error('Missing Stripe signature header.');
    }

    return getStripeClient().webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
};
