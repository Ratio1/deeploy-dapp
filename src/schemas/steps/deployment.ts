import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { SERVICE_TYPES } from '@data/serviceTypes';
import { dynamicEnvEntrySchema, enabledBooleanTypeValue, getKeyValueEntriesArraySchema, nodeSchema } from '@schemas/common';
import { z } from 'zod';

// Common validation patterns
const commonValidations = {
    // String patterns
    appAlias: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(36, 'Value cannot exceed 36 characters')
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        ),

    containerImage: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(256, 'Value cannot exceed 256 characters'),

    containerRegistry: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^[^/]+\.[^/]+$/, 'Must be a valid domain format'),

    crUsername: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed'),

    crPassword: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(64, 'Value cannot exceed 64 characters')
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed'),

    pipelineInputType: z
        .string({ required_error: 'Value is required' })
        .min(2, 'Value must be at least 2 characters')
        .max(256, 'Value cannot exceed 256 characters'),

    pipelineInputUri: z
        .string({ required_error: 'Value is required' })
        .min(2, 'Value must be at least 2 characters')
        .max(256, 'Value cannot exceed 256 characters')
        .regex(/^https?:\/\/.+/, 'Must be a valid URI'),

    // Number patterns
    port: z
        .union([
            z.literal(''),
            z
                .number()
                .int('Value must be a whole number')
                .min(1, 'Value must be at least 1')
                .max(65535, 'Value cannot exceed 65535'),
        ])
        .refine((val) => val !== '', { message: 'Value is required' })
        .transform((val) => (!val ? undefined : (val as number))) as z.ZodType<number>,

    envVars: getKeyValueEntriesArraySchema(),
    dynamicEnvVars: z
        .array(dynamicEnvEntrySchema)
        .max(50, 'Maximum 50 dynamic environment variables')
        .refine(
            (entries) => {
                const keys = entries.map((entry) => entry.key?.trim()).filter((key) => key && key !== ''); // Only non-empty keys

                const uniqueKeys = new Set(keys);
                return uniqueKeys.size === keys.length;
            },
            {
                message: 'Duplicate keys are not allowed',
            },
        ),
    customParams: getKeyValueEntriesArraySchema(50),
    pipelineParams: getKeyValueEntriesArraySchema(50),

    // Enum patterns
    restartPolicy: z.enum(POLICY_TYPES, { required_error: 'Value is required' }),
    imagePullPolicy: z.enum(POLICY_TYPES, { required_error: 'Value is required' }),
    pluginSignature: z.enum(PLUGIN_SIGNATURE_TYPES, { required_error: 'Value is required' }),
    serviceType: z.enum(SERVICE_TYPES, { required_error: 'Value is required' }),
    chainstoreResponse: z.enum(BOOLEAN_TYPES, { required_error: 'Value is required' }),
};

// Helper functions for tunneling refinements
const createTunnelingRequiredRefinement = (fieldName: 'tunnelingToken') => {
    return (data: { [key: string]: any }) => {
        if (data.enableTunneling !== enabledBooleanTypeValue) {
            return true; // Allow undefined when tunneling is not enabled
        }
        return data[fieldName] !== undefined;
    };
};

const tunnelingRefinements = {
    tunnelingToken: {
        refine: createTunnelingRequiredRefinement('tunnelingToken'),
        options: {
            message: 'Required when tunneling is enabled',
            path: ['tunnelingToken'],
        },
    },
};

// Helper function to apply tunneling refinements
const applyTunnelingRefinements = (schema: z.ZodObject<any>) => {
    return schema.refine(tunnelingRefinements.tunnelingToken.refine, tunnelingRefinements.tunnelingToken.options);
};

const baseDeploymentSchema = z.object({
    targetNodes: z.array(nodeSchema).refine(
        (nodes) => {
            const addresses = nodes.map((node) => node.address?.trim()).filter((address) => address && address !== ''); // Only non-empty addresses

            const uniqueAddresses = new Set(addresses);
            return uniqueAddresses.size === addresses.length;
        },
        {
            message: 'Duplicate addresses are not allowed',
        },
    ),
    enableTunneling: z.enum(BOOLEAN_TYPES, { required_error: 'Value is required' }),
    tunnelingLabel: z
        .string()
        .min(3, 'Value must be at least 3 characters')
        .max(64, 'Value cannot exceed 64 characters')
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        )
        .optional(),
    tunnelingToken: z
        .string()
        .min(3, 'Value must be at least 3 characters')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        )
        .optional(),
});

export const genericAppDeploymentSchema = applyTunnelingRefinements(
    baseDeploymentSchema.extend({
        appAlias: commonValidations.appAlias,
        containerImage: commonValidations.containerImage,
        containerRegistry: commonValidations.containerRegistry,
        crUsername: commonValidations.crUsername,
        crPassword: commonValidations.crPassword,
        port: commonValidations.port,
        envVars: commonValidations.envVars,
        dynamicEnvVars: commonValidations.dynamicEnvVars,
        restartPolicy: commonValidations.restartPolicy,
        imagePullPolicy: commonValidations.imagePullPolicy,
    }),
);

export const nativeAppDeploymentSchema = applyTunnelingRefinements(
    baseDeploymentSchema.extend({
        appAlias: commonValidations.appAlias,
        pluginSignature: commonValidations.pluginSignature,
        customParams: commonValidations.customParams,
        pipelineParams: commonValidations.pipelineParams,
        pipelineInputType: commonValidations.pipelineInputType,
        pipelineInputUri: commonValidations.pipelineInputUri,
        chainstoreResponse: commonValidations.chainstoreResponse,
    }),
);

export const serviceAppDeploymentSchema = applyTunnelingRefinements(
    baseDeploymentSchema.extend({
        serviceType: commonValidations.serviceType,
        envVars: commonValidations.envVars,
        dynamicEnvVars: commonValidations.dynamicEnvVars,
        serviceReplica: nodeSchema.shape.address,
    }),
);
