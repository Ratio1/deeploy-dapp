import { z } from 'zod';

export const costAndDurationSchema = z.object({
    duration: z
        .number()
        .int('Duration must be a whole number')
        .min(1, 'Duration must be at least 1 month')
        .max(24, 'Duration cannot exceed 24 months'),
    paymentMonthsCount: z
        .number()
        .int('Payment months count must be a whole number')
        .min(1, 'Payment months count must be at least 1 month')
        .max(24, 'Payment months count cannot exceed 24 months'),
});
