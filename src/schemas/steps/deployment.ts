import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { dynamicEnvEntrySchema, enabledBooleanTypeValue, keyValueEntrySchema, targetNodeEntrySchema } from '@schemas/common';
import { z } from 'zod';

// Helper functions for ngrok refinements
const createNgrokRequiredRefinement = (fieldName: 'ngrokEdgeLabel' | 'ngrokAuthToken') => {
    return (data: { enableNgrok: string; [key: string]: any }) => {
        if (data.enableNgrok !== enabledBooleanTypeValue) {
            return true; // Allow undefined when ngrok is not enabled
        }
        return data[fieldName] !== undefined;
    };
};

const ngrokRefinements = {
    ngrokEdgeLabel: {
        refine: createNgrokRequiredRefinement('ngrokEdgeLabel'),
        options: {
            message: 'Required when NGROK is enabled',
            path: ['ngrokEdgeLabel'],
        },
    },
    ngrokAuthToken: {
        refine: createNgrokRequiredRefinement('ngrokAuthToken'),
        options: {
            message: 'Required when NGROK is enabled',
            path: ['ngrokAuthToken'],
        },
    },
};

const baseDeploymentSchema = z.object({
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
});

const genericAppDeploymentSchema = baseDeploymentSchema.extend({
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
        .union([
            z.literal(''),
            z
                .number()
                .int('Value must be a whole number')
                .min(1, 'Value must be at least 1')
                .max(65535, 'Value cannot exceed 65535'),
        ])
        .refine((val) => val !== '', {
            message: 'Value is required',
        })
        .transform((val) => {
            if (!val) return undefined;
            return val as number;
        }) as z.ZodType<number>,
    envVars: z.array(keyValueEntrySchema).max(10, 'Maximum 10 entries allowed'),
    dynamicEnvVars: z.array(dynamicEnvEntrySchema).max(10, 'Maximum 10 dynamic environment variables'),
    restartPolicy: z.enum(POLICY_TYPES, {
        required_error: 'Value is required',
    }),
    imagePullPolicy: z.enum(POLICY_TYPES, {
        required_error: 'Value is required',
    }),
});

const nativeAppDeploymentSchema = baseDeploymentSchema.extend({
    pluginSignature: z.enum(PLUGIN_SIGNATURE_TYPES, {
        required_error: 'Value is required',
    }),
    customParams: z.array(keyValueEntrySchema).max(10, 'Maximum 10 entries allowed'),
    pipelineParams: z.array(keyValueEntrySchema).max(10, 'Maximum 10 entries allowed'),
    pipelineInputType: z
        .string({
            required_error: 'Value is required',
        })
        .min(2, 'Value must be at least 2 characters')
        .max(256, 'Value cannot exceed 256 characters'),
    pipelineInputUri: z
        .string({
            required_error: 'Value is required',
        })
        .min(2, 'Value must be at least 2 characters')
        .max(256, 'Value cannot exceed 256 characters')
        .regex(/^https?:\/\/.+/, 'Must be a valid URI'),
});

// TODO: Add SERVICE deployment schemas here

export const genericAppDeploymentSchemaWithRefinements = genericAppDeploymentSchema
    .refine(ngrokRefinements.ngrokEdgeLabel.refine, ngrokRefinements.ngrokEdgeLabel.options)
    .refine(ngrokRefinements.ngrokAuthToken.refine, ngrokRefinements.ngrokAuthToken.options);

export const nativeAppDeploymentSchemaWithRefinements = nativeAppDeploymentSchema
    .refine(ngrokRefinements.ngrokEdgeLabel.refine, ngrokRefinements.ngrokEdgeLabel.options)
    .refine(ngrokRefinements.ngrokAuthToken.refine, ngrokRefinements.ngrokAuthToken.options);
