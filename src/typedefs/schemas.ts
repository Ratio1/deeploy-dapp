import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { z } from 'zod';

const customContainerType = CONTAINER_TYPES[CONTAINER_TYPES.length - 1];
const enabledType = BOOLEAN_TYPES[0];

export const deeployAppSchema = z
    .object({
        // Step 1: Specifications
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
        // Step 3: Deployment
        appAlias: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(36, 'Value cannot exceed 36 characters')
            .regex(
                /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
                'Only letters, numbers, spaces and special characters allowed',
            ),
        port: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(65535, 'Value cannot exceed 65535'),
        enableNgrok: z.enum(BOOLEAN_TYPES, {
            required_error: 'Value is required',
        }),
        ngrokEdgeLabel: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(64, 'Value cannot exceed 64 characters')
            .regex(
                /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
                'Only letters, numbers, spaces and special characters allowed',
            )
            .optional(),
        ngrokAuthToken: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(128, 'Value cannot exceed 128 characters')
            .regex(
                /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
                'Only letters, numbers, spaces and special characters allowed',
            )
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
            path: ['customCpu'],
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
            path: ['customMemory'],
        },
    )
    .refine(
        (data) => {
            if (data.enableNgrok === enabledType) {
                return data.ngrokEdgeLabel !== undefined && data.ngrokAuthToken !== undefined;
            }
            return true;
        },
        {
            message: 'Required when using NGROK',
            path: ['ngrokEdgeLabel'],
        },
    )
    .refine(
        (data) => {
            if (data.enableNgrok === enabledType) {
                return data.ngrokEdgeLabel !== undefined && data.ngrokAuthToken !== undefined;
            }
            return true;
        },
        {
            message: 'Required when using NGROK',
            path: ['ngrokAuthToken'],
        },
    );
