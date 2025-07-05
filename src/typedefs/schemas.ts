import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { z } from 'zod';
import { FormType } from './deployment';

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

const targetNodeSchema = z.object({
    address: z
        .string()
        .max(52, 'Value cannot exceed 52 characters')
        .refine((val) => val === '' || /^0xai_[A-Za-z0-9_-]+$/.test(val), 'Must be a valid node address'),
});

const dynamicEnvPairSchema = z.object({
    type: z.enum(DYNAMIC_ENV_TYPES),
    value: z
        .string()
        .min(1, 'Value is required')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed'),
});

// The key + the 3 key-value pairs
const dynamicEnvEntrySchema = z.object({
    key: z
        .string()
        .min(1, 'Key is required')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed'),
    values: z.array(dynamicEnvPairSchema).length(3, 'Must have exactly 3 value pairs'),
});

// Step 2: Specifications Schema
const specificationsStepBase = z.object({
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

export const specificationsStepSchema = specificationsStepBase
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
    .transform((data) => {
        // Transform the data to make customCpu and customMemory optional for non-custom types
        const transformed = { ...data } as any;

        if (data.containerType !== customContainerType) {
            transformed.customCpu = undefined;
            transformed.customMemory = undefined;
        }

        return transformed;
    });

// Step 4: Deployment Schema
const deploymentStepBase = z.object({
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
    targetNodes: z.array(targetNodeSchema).max(10, 'You can define up to 10 target nodes'),
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
    envVars: z.array(envVarSchema).max(10, 'Maximum 10 environment variables'),
    dynamicEnvVars: z.array(dynamicEnvEntrySchema).max(10, 'Maximum 10 dynamic environment variables'),
    restartPolicy: z.enum(POLICY_TYPES, {
        required_error: 'Value is required',
    }),
    imagePullPolicy: z.enum(POLICY_TYPES, {
        required_error: 'Value is required',
    }),
});

export const deploymentStepSchema = deploymentStepBase
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
        // Transform the data to make ngrok fields optional when ngrok is not enabled
        const transformed = { ...data } as any;

        if (data.enableNgrok !== enabledBooleanType) {
            transformed.ngrokEdgeLabel = undefined;
            transformed.ngrokAuthToken = undefined;
        }

        return transformed;
    });

// Combined schema for the entire form
export const deeployAppSchema = z.object({
    formType: z.enum([FormType.Generic, FormType.Native, FormType.Service]),
    ...specificationsStepBase.shape,
    ...deploymentStepBase.shape,
});

// Extract keys for programmatic use
const specificationsKeys = Object.keys(specificationsStepBase.shape) as (keyof z.infer<typeof specificationsStepBase>)[];
const deploymentKeys = Object.keys(deploymentStepBase.shape) as (keyof z.infer<typeof deploymentStepBase>)[];

// Filtered keys excluding conditional fields
export const specificationsBaseKeys = specificationsKeys.filter(
    (key) => !['customCpu', 'customMemory'].includes(key),
) as (keyof z.infer<typeof specificationsStepBase>)[];

export const deploymentBaseKeys = deploymentKeys.filter(
    (key) => !['ngrokEdgeLabel', 'ngrokAuthToken'].includes(key),
) as (keyof z.infer<typeof deploymentStepBase>)[];
