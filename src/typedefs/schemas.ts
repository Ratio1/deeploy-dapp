import { APPLICATION_TYPES } from '@data/applicationTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { z } from 'zod';

const customContainerType = CONTAINER_TYPES[CONTAINER_TYPES.length - 1];

export const deeployAppSchema = z
    .object({
        applicationType: z.enum(APPLICATION_TYPES, {
            required_error: 'Application type is required',
        }),
        targetNodesCount: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(100, 'Value cannot exceed 100'),
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
            .max(100, 'Value cannot exceed 100')
            .optional(),
        customMemory: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(1000000, 'Value cannot exceed 1000000')
            .optional(),
    })
    .refine(
        (data) => {
            if (data.containerType === customContainerType) {
                return data.customCpu !== undefined && data.customMemory !== undefined;
            }
            return true;
        },
        {
            message: 'Required when using a custom container',
            path: ['customCpu'], // This will show the error on the customCpu field
        },
    )
    .refine(
        (data) => {
            if (data.containerType === customContainerType) {
                return data.customCpu !== undefined && data.customMemory !== undefined;
            }
            return true;
        },
        {
            message: 'Required when using a custom container',
            path: ['customMemory'], // This will show the error on the customMemory field
        },
    );
