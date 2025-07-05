import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { dynamicEnvEntrySchema, enabledBooleanTypeValue, envVarEntrySchema, targetNodeEntrySchema } from '@schemas/common';
import { z } from 'zod';

const deploymentSchema = z.object({
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
    targetNodes: z.array(targetNodeEntrySchema).max(10, 'You can define up to 10 target nodes'),
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
        .string()
        .min(3, 'Value must be at least 3 characters')
        .max(64, 'Value cannot exceed 64 characters')
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        )
        .optional(),
    ngrokAuthToken: z
        .string()
        .min(3, 'Value must be at least 3 characters')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        )
        .optional(),
    envVars: z.array(envVarEntrySchema).max(10, 'Maximum 10 environment variables'),
    dynamicEnvVars: z.array(dynamicEnvEntrySchema).max(10, 'Maximum 10 dynamic environment variables'),
    restartPolicy: z.enum(POLICY_TYPES, {
        required_error: 'Value is required',
    }),
    imagePullPolicy: z.enum(POLICY_TYPES, {
        required_error: 'Value is required',
    }),
});

const deploymentSchemaWithRefinements = deploymentSchema
    .refine(
        (data) => {
            if (data.enableNgrok !== enabledBooleanTypeValue) {
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
            if (data.enableNgrok !== enabledBooleanTypeValue) {
                return true; // Allow undefined when ngrok is not enabled
            }
            return data.ngrokEdgeLabel !== undefined && data.ngrokAuthToken !== undefined;
        },
        {
            message: 'Required when NGROK is enabled',
            path: ['ngrokAuthToken'],
        },
    );

// Extract keys for programmatic use
const deploymentKeys = Object.keys(deploymentSchema.shape) as (keyof z.infer<typeof deploymentSchema>)[];

// Filtered keys excluding conditional fields
export const deploymentBaseKeys = deploymentKeys.filter(
    (key) => !['ngrokEdgeLabel', 'ngrokAuthToken'].includes(key),
) as (keyof z.infer<typeof deploymentSchema>)[];

export default deploymentSchemaWithRefinements;
