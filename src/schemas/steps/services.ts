import z from 'zod';

export const serviceIdSchema = z.number().int('Value must be a whole number').min(1, 'Value must be at least 1');
