import { COLOR_TYPES } from '@data/colorTypes';
import z from 'zod';

export const projectSchema = z.object({
    name: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(36, 'Value cannot exceed 36 characters')
        .regex(/^[a-zA-Z0-9_-]*$/, 'Only letters, numbers, underscores and hyphens allowed'),
    color: z.enum(COLOR_TYPES.map((color) => color.hex) as [string, ...string[]]),
});
