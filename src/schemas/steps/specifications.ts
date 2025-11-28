import { genericContainerTypes, gpuTypes, nativeWorkerTypes } from '@data/containerResources';
import { serviceContainerTypes } from '@data/services';
import { z } from 'zod';

const getRequiredIntegerSchema = (max: number) => {
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
    gpuType: z.union([z.literal(''), z.enum(gpuTypes.map((type) => type.name) as [string, ...string[]])]).optional(),
    // applicationType: z.enum(APPLICATION_TYPES, { required_error: 'Application type is required' }).optional(), // Disabled for now
    targetNodesCount: getRequiredIntegerSchema(100),
    jobTags: z.array(z.string()),
    nodesCountries: z.array(z.string()),
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
    serviceContainerType: z.enum(serviceContainerTypes.map((type) => type.name) as [string, ...string[]], {
        required_error: 'Container type is required',
    }),
});
