import { APPLICATION_TYPES } from '@data/applicationTypes';
import { genericContainerTypes, nativeWorkerTypes, serviceContainerTypes } from '@data/containerTypes';
import { z } from 'zod';

// Common number validation pattern
const createNumberField = (min: number, max: number, required: boolean = true) => {
    if (required) {
        return z
            .union([
                z.literal(''),
                z
                    .number()
                    .int('Value must be a whole number')
                    .min(min, `Value must be at least ${min}`)
                    .max(max, `Value cannot exceed ${max}`),
            ])
            .refine((val) => val !== '', { message: 'Value is required' })
            .transform((val) => val as number) as z.ZodType<number>;
    } else {
        return z
            .union([
                z.literal(''),
                z
                    .number()
                    .int('Value must be a whole number')
                    .min(min, `Value must be at least ${min}`)
                    .max(max, `Value cannot exceed ${max}`),
            ])
            .transform((val) => (val === '' ? undefined : (val as number)))
            .optional() as z.ZodOptional<z.ZodType<number | undefined>>;
    }
};

const baseSpecificationsSchema = z.object({
    applicationType: z.enum(APPLICATION_TYPES, { required_error: 'Application type is required' }),
    targetNodesCount: createNumberField(1, 100, true),
});

export const genericSpecificationsSchema = baseSpecificationsSchema.extend({
    type: z.literal('Generic'),
    containerType: z.enum(genericContainerTypes.map((type) => type.name) as [string, ...string[]], {
        required_error: 'Container type is required',
    }),
});

export const nativeSpecificationsSchema = baseSpecificationsSchema.extend({
    type: z.literal('Native'),
    workerType: z.enum(nativeWorkerTypes.map((type) => type.name) as [string, ...string[]], {
        required_error: 'Worker type is required',
    }),
});

export const serviceSpecificationsSchema = baseSpecificationsSchema.extend({
    type: z.literal('Service'),
    containerType: z.enum(serviceContainerTypes.map((type) => type.name) as [string, ...string[]], {
        required_error: 'Container type is required',
    }),
});

// Extract keys for programmatic use
export const specificationsKeys = Object.keys(baseSpecificationsSchema.shape) as (keyof z.infer<
    typeof baseSpecificationsSchema
>)[];
