import z from 'zod';
import { getStringSchema } from './common';

export const addSecretsSchema = z.object({
    accountId: getStringSchema(1, 256),
    zoneId: getStringSchema(1, 256),
    apiKey: getStringSchema(1, 256),
    domain: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^[^/]+\.[^/]+$/, 'Must be a valid domain format'),
});
