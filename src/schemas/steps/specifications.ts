import { APPLICATION_TYPES } from '@data/applicationTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { customContainerTypeValue } from '@schemas/common';
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

// Common validation patterns
const commonValidations = {
    applicationType: z.enum(APPLICATION_TYPES, { required_error: 'Application type is required' }),
    containerType: z.enum(CONTAINER_TYPES, { required_error: 'Container type is required' }),

    // Number fields
    targetNodesCount: createNumberField(0, 100, true),
    cpu: createNumberField(1, 100, true),
    memory: createNumberField(1, 1000, true),
    customCpu: createNumberField(1, 100, false),
    customMemory: createNumberField(1, 1000000, false),
};

const specificationsSchema = z.object({
    applicationType: commonValidations.applicationType,
    targetNodesCount: commonValidations.targetNodesCount,
    containerType: commonValidations.containerType,
    cpu: commonValidations.cpu,
    memory: commonValidations.memory,
    customCpu: commonValidations.customCpu,
    customMemory: commonValidations.customMemory,
});

// Helper function to create custom container refinements
const createCustomContainerRefinement = (fieldName: 'customCpu' | 'customMemory') => {
    return (data: { containerType: string; [key: string]: any }) => {
        if (data.containerType !== customContainerTypeValue) {
            return true; // Allow undefined for non-custom container types
        }
        const value = data[fieldName];
        return value !== undefined && value !== null && value !== '';
    };
};

const specificationsSchemaWithRefinements = specificationsSchema
    .refine(createCustomContainerRefinement('customCpu'), {
        message: 'Required when using a custom container',
        path: ['customCpu'],
    })
    .refine(createCustomContainerRefinement('customMemory'), {
        message: 'Required when using a custom container',
        path: ['customMemory'],
    });

// Extract keys for programmatic use
const specificationsKeys = Object.keys(specificationsSchema.shape) as (keyof z.infer<typeof specificationsSchema>)[];

// Filtered keys excluding conditional fields
export const specificationsBaseKeys = specificationsKeys.filter(
    (key) => !['customCpu', 'customMemory'].includes(key),
) as (keyof z.infer<typeof specificationsSchema>)[];

export default specificationsSchemaWithRefinements;
