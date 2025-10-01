import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import {
    dynamicEnvEntrySchema,
    enabledBooleanTypeValue,
    getKeyValueEntriesArraySchema,
    getNameWithoutSpacesSchema,
    getStringSchema,
    nodeSchema,
    workerCommandSchema,
} from '@schemas/common';
import { z } from 'zod';

// Common validation patterns
const validations = {
    // String patterns
    jobAlias: getNameWithoutSpacesSchema(3, 36),

    containerImage: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(256, 'Value cannot exceed 256 characters'),

    containerRegistry: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^[^/]+\.[^/]+$/, 'Must be a valid domain format'),

    uri: z
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
    volumes: getKeyValueEntriesArraySchema(),

    // Enum patterns
    restartPolicy: z.enum(POLICY_TYPES, { required_error: 'Value is required' }),
    imagePullPolicy: z.enum(POLICY_TYPES, { required_error: 'Value is required' }),
    pluginSignature: z.enum(PLUGIN_SIGNATURE_TYPES, { required_error: 'Value is required' }),
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
    spareNodes: z.array(nodeSchema).refine(
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
    allowReplicationInTheWild: z.boolean(),
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
        .max(512, 'Value cannot exceed 512 characters')
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        )
        .optional(),
});

const imageSchema = z.object({
    type: z.literal('image'),
    containerImage: validations.containerImage,
    containerRegistry: validations.containerRegistry,
    crVisibility: z.enum(CR_VISIBILITY_OPTIONS, { required_error: 'Value is required' }),
    crUsername: z.union([getStringSchema(3, 128), z.literal('')]).optional(),
    crPassword: z.union([getStringSchema(3, 256), z.literal('')]).optional(),
});

const workerSchema = z.object({
    type: z.literal('worker'),
    image: getStringSchema(3, 256),
    repository: getStringSchema(3, 256),
    owner: getStringSchema(3, 256),
    username: getStringSchema(3, 256),
    accessToken: z
        .string()
        .max(512, 'Value cannot exceed 512 characters')
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed')
        .optional(),
    workerCommands: z.array(workerCommandSchema).refine(
        (workerCommand) => {
            const commands = workerCommand.map((node) => node.command?.trim()).filter((command) => command && command !== ''); // Only non-empty commands

            const uniqueCommands = new Set(commands);
            return uniqueCommands.size === commands.length;
        },
        {
            message: 'Duplicate commands are not allowed',
        },
    ),
});

const deploymentTypeSchema = z.discriminatedUnion('type', [imageSchema, workerSchema]);

const genericAppDeploymentSchemaWihtoutRefinements = baseDeploymentSchema.extend({
    jobAlias: validations.jobAlias,
    deploymentType: deploymentTypeSchema,
    port: validations.port,
    envVars: validations.envVars,
    dynamicEnvVars: validations.dynamicEnvVars,
    volumes: validations.volumes,
    restartPolicy: validations.restartPolicy,
    imagePullPolicy: validations.imagePullPolicy,
});

export const genericAppDeploymentSchema = applyTunnelingRefinements(genericAppDeploymentSchemaWihtoutRefinements).superRefine(
    (data, ctx) => {
        // Validate that crUsername and crPassword are provided when crVisibility is 'Private'
        if (data.deploymentType.type === 'image' && data.deploymentType.crVisibility === 'Private') {
            if (!data.deploymentType.crUsername) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Username is required',
                    path: ['container', 'crUsername'],
                });
            }
            if (!data.deploymentType.crPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Password/Authentication Token is required',
                    path: ['container', 'crPassword'],
                });
            }
        }
    },
);

const nativeAppDeploymentSchemaWihtoutRefinements = baseDeploymentSchema.extend({
    jobAlias: validations.jobAlias,
    pluginSignature: validations.pluginSignature,
    port: validations.port,
    customParams: validations.customParams,
    pipelineParams: validations.pipelineParams,
    pipelineInputType: z.enum(PIPELINE_INPUT_TYPES, { required_error: 'Value is required' }),
    pipelineInputUri: validations.uri.optional(),
    chainstoreResponse: validations.chainstoreResponse,
});

export const nativeAppDeploymentSchema = applyTunnelingRefinements(nativeAppDeploymentSchemaWihtoutRefinements);

const serviceAppDeploymentSchemaWihtoutRefinements = baseDeploymentSchema.extend({
    jobAlias: validations.jobAlias,
    envVars: validations.envVars,
    dynamicEnvVars: validations.dynamicEnvVars,
    volumes: validations.volumes,
    serviceReplica: nodeSchema.shape.address.optional(),
});

export const serviceAppDeploymentSchema = applyTunnelingRefinements(serviceAppDeploymentSchemaWihtoutRefinements);
