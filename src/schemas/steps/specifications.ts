import { APPLICATION_TYPES } from '@data/applicationTypes';
import { genericContainerTypes, nativeWorkerTypes, serviceContainerTypes } from '@data/containerAndWorkerTypes';
import { z } from 'zod';

// Common number validation pattern
const createNumberField = (max: number) => {
    return z
        .union([z.literal(''), z.number().int('Value must be a whole number').max(max, `Value cannot exceed ${max}`)])
        .refine((val) => val !== '', { message: 'Value is required' })
        .transform((val) => val as number) as z.ZodType<number>;
};

// Helper function to get minimal balancing for a container/worker type
const getMinimalBalancing = (type: string, containerType: string | undefined): number => {
    if (type === 'Generic' && containerType) {
        const found = genericContainerTypes.find((t) => t.name === containerType);
        return found?.minimalBalancing || 1;
    }
    if (type === 'Native' && containerType) {
        const found = nativeWorkerTypes.find((t) => t.name === containerType);
        return found?.minimalBalancing || 1;
    }
    if (type === 'Service' && containerType) {
        const found = serviceContainerTypes.find((t) => t.name === containerType);
        return found?.minimalBalancing || 1;
    }
    return 1;
};

const baseSpecificationsSchema = z.object({
    applicationType: z.enum(APPLICATION_TYPES, { required_error: 'Application type is required' }),
    targetNodesCount: createNumberField(100),
});

export const genericSpecificationsSchema = baseSpecificationsSchema
    .extend({
        containerType: z.enum(genericContainerTypes.map((type) => type.name) as [string, ...string[]], {
            required_error: 'Container type is required',
        }),
    })
    .superRefine((data, ctx) => {
        const minBalancing = getMinimalBalancing('Generic', data.containerType);
        if (data.targetNodesCount < minBalancing) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_small,
                minimum: minBalancing,
                type: 'number',
                inclusive: true,
                path: ['targetNodesCount'],
                message: `Target nodes count must be at least ${minBalancing}`,
            });
        }
    });

export const nativeSpecificationsSchema = baseSpecificationsSchema
    .extend({
        workerType: z.enum(nativeWorkerTypes.map((type) => type.name) as [string, ...string[]], {
            required_error: 'Worker type is required',
        }),
    })
    .superRefine((data, ctx) => {
        const minBalancing = getMinimalBalancing('Native', data.workerType);
        if (data.targetNodesCount < minBalancing) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_small,
                minimum: minBalancing,
                type: 'number',
                inclusive: true,
                path: ['targetNodesCount'],
                message: `Target nodes count must be at least ${minBalancing}`,
            });
        }
    });

export const serviceSpecificationsSchema = baseSpecificationsSchema
    .extend({
        containerType: z.enum(serviceContainerTypes.map((type) => type.name) as [string, ...string[]], {
            required_error: 'Container type is required',
        }),
    })
    .superRefine((data, ctx) => {
        const minBalancing = getMinimalBalancing('Service', data.containerType);
        if (data.targetNodesCount < minBalancing) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_small,
                minimum: minBalancing,
                type: 'number',
                inclusive: true,
                path: ['targetNodesCount'],
                message: `Target nodes count must be at least ${minBalancing}`,
            });
        }
    });
