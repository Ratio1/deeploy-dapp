import { APPLICATION_TYPES } from '@data/applicationTypes';
import { genericContainerTypes, nativeWorkerTypes, serviceContainerTypes } from '@data/containerResources';
import { z } from 'zod';

// Common number validation pattern
const createNumberField = (max: number) => {
    return z
        .union([
            z.literal(''),
            z
                .number()
                .int('Value must be a whole number')
                .min(1, 'Value must be at least 1')
                .max(max, `Value cannot exceed ${max}`),
        ])
        .refine((val) => val !== '', { message: 'Value is required' })
        .transform((val) => val as number) as z.ZodType<number>;
};

const baseSpecificationsSchema = z.object({
    applicationType: z.enum(APPLICATION_TYPES, { required_error: 'Application type is required' }),
    targetNodesCount: createNumberField(100),
});

export const genericSpecificationsSchema = baseSpecificationsSchema.extend({
    containerType: z.enum(genericContainerTypes.map((type) => type.name) as [string, ...string[]], {
        required_error: 'Container type is required',
    }),
});

export const nativeSpecificationsSchema = baseSpecificationsSchema.extend({
    workerType: z.enum(nativeWorkerTypes.map((type) => type.name) as [string, ...string[]], {
        required_error: 'Worker type is required',
    }),
});

export const serviceSpecificationsSchema = baseSpecificationsSchema.extend({
    containerType: z.enum(serviceContainerTypes.map((type) => type.name) as [string, ...string[]], {
        required_error: 'Container type is required',
    }),
});
