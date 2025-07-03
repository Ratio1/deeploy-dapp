import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { z } from 'zod';

export const customContainerType = CONTAINER_TYPES[CONTAINER_TYPES.length - 1];
export const enabledBooleanType = BOOLEAN_TYPES[0];

const envVarSchema = z
    .object({
        key: z.string().optional(),
        value: z.string().optional(),
    })
    .refine(
        (data) => {
            if (!data.key && !data.value) {
                return true; // Both empty is valid (empty row)
            }
            if (!data.key) {
                return false; // Key missing
            }
            return true; // Key present
        },
        {
            message: 'Key is required',
            path: ['key'],
        },
    )
    .refine(
        (data) => {
            if (!data.key && !data.value) {
                return true; // Both empty is valid (empty row)
            }
            if (!data.value) {
                return false; // Value missing
            }
            return true; // Value present
        },
        {
            message: 'Value is required',
            path: ['value'],
        },
    );

export const deeployAppSchema = z
    .object({
        // Step: Specifications
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
            .max(100, 'Value cannot exceed 100'),
        customMemory: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(1000000, 'Value cannot exceed 1000000'),
        // Step: Deployment
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
        envVars: z.array(envVarSchema).max(10, 'Maximum 10 environment variables'),
        containerImage: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(256, 'Value cannot exceed 256 characters'),
        containerRegistry: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(128, 'Value cannot exceed 128 characters')
            .regex(/^[^/]+\.[^/]+$/, 'Must be a valid domain format'),
        crUsername: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(128, 'Value cannot exceed 128 characters')
            .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed'),
        crPassword: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(64, 'Value cannot exceed 64 characters')
            .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed'),
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
            ),
        ngrokAuthToken: z
            .string({
                required_error: 'Value is required',
            })
            .min(3, 'Value must be at least 3 characters')
            .max(128, 'Value cannot exceed 128 characters')
            .regex(
                /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
                'Only letters, numbers, spaces and special characters allowed',
            ),
        restartPolicy: z.enum(POLICY_TYPES, {
            required_error: 'Value is required',
        }),
        imagePullPolicy: z.enum(POLICY_TYPES, {
            required_error: 'Value is required',
        }),
    })
    .refine(
        (data) => {
            if (data.containerType !== customContainerType) {
                return true; // Allow undefined for non-custom types
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
            if (data.containerType !== customContainerType) {
                return true; // Allow undefined for non-custom types
            }
            return data.customCpu !== undefined && data.customMemory !== undefined;
        },
        {
            message: 'Required when using a custom container',
            path: ['customMemory'],
        },
    )
    .refine(
        (data) => {
            if (data.enableNgrok !== enabledBooleanType) {
                return true; // Allow undefined when ngrok is not enabled
            }
            return data.ngrokEdgeLabel !== undefined && data.ngrokAuthToken !== undefined;
        },
        {
            message: 'Required when NGROK is enabled',
            path: ['ngrokEdgeLabel'],
        },
    )
    .refine(
        (data) => {
            if (data.enableNgrok !== enabledBooleanType) {
                return true; // Allow undefined when ngrok is not enabled
            }
            return data.ngrokEdgeLabel !== undefined && data.ngrokAuthToken !== undefined;
        },
        {
            message: 'Required when NGROK is enabled',
            path: ['ngrokAuthToken'],
        },
    )
    .transform((data) => {
        // Transform the data to make values optional when necessary
        const transformed = { ...data } as any;

        if (data.containerType !== customContainerType) {
            transformed.customCpu = undefined;
            transformed.customMemory = undefined;
        }

        if (data.enableNgrok !== enabledBooleanType) {
            transformed.ngrokEdgeLabel = undefined;
            transformed.ngrokAuthToken = undefined;
        }

        return transformed;
    });
