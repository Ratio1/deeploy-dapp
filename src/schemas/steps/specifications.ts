import { APPLICATION_TYPES } from '@data/applicationTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { customContainerTypeValue } from '@schemas/common';
import { z } from 'zod';

const specificationsSchema = z.object({
    applicationType: z.enum(APPLICATION_TYPES, {
        required_error: 'Application type is required',
    }),
    targetNodesCount: z
        .union([
            z.literal(''),
            z
                .number()
                .int('Value must be a whole number')
                .min(0, 'Value must be at least 0')
                .max(100, 'Value cannot exceed 100'),
        ])
        .transform((val) => {
            if (val === '') return undefined;
            return val as number;
        })
        .optional() as z.ZodOptional<z.ZodType<number | undefined>>,
    containerType: z.enum(CONTAINER_TYPES, {
        required_error: 'Container type is required',
    }),
    cpu: z
        .number({
            required_error: 'Value is required',
            invalid_type_error: 'Value must be a number',
        })
        .int('Value must be a whole number')
        .min(1, 'Value must be at least 1')
        .max(100, 'Value cannot exceed 100'),
    memory: z
        .number({
            required_error: 'Value is required',
            invalid_type_error: 'Value must be a number',
        })
        .int('Value must be a whole number')
        .min(1, 'Value must be at least 1')
        .max(1000, 'Value cannot exceed 1000'),
    customCpu: z
        .number({
            required_error: 'Value is required',
            invalid_type_error: 'Value must be a number',
        })
        .int('Value must be a whole number')
        .min(1, 'Value must be at least 1')
        .max(100, 'Value cannot exceed 100'),
    customMemory: z
        .number({
            required_error: 'Value is required',
            invalid_type_error: 'Value must be a number',
        })
        .int('Value must be a whole number')
        .min(1, 'Value must be at least 1')
        .max(1000000, 'Value cannot exceed 1000000'),
});

specificationsSchema
    .refine(
        (data) => {
            if (data.containerType !== customContainerTypeValue) {
                return true; // Allow undefined for non-custom container types
            }
            return data.customCpu !== undefined && data.customMemory !== undefined;
        },
        {
            message: 'Required when using a custom container',
            path: ['customCpu'],
        },
    )
    .refine(
        (data) => {
            if (data.containerType !== customContainerTypeValue) {
                return true; // Allow undefined for non-custom container types
            }
            return data.customCpu !== undefined && data.customMemory !== undefined;
        },
        {
            message: 'Required when using a custom container',
            path: ['customMemory'],
        },
    )
    .transform((data) => {
        // Transform the data to make customCpu and customMemory optional for non-custom container types
        const transformed = { ...data } as any;

        if (data.containerType !== customContainerTypeValue) {
            transformed.customCpu = undefined;
            transformed.customMemory = undefined;
        }

        return transformed;
    });

// Extract keys for programmatic use
const specificationsKeys = Object.keys(specificationsSchema.shape) as (keyof z.infer<typeof specificationsSchema>)[];

// Filtered keys excluding conditional fields
export const specificationsBaseKeys = specificationsKeys.filter(
    (key) => !['customCpu', 'customMemory'].includes(key),
) as (keyof z.infer<typeof specificationsSchema>)[];

export default specificationsSchema;
