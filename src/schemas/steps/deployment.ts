import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import {
    dynamicEnvEntrySchema,
    enabledBooleanTypeValue,
    getCustomParametersArraySchema,
    getFileVolumesArraySchema,
    getKeyValueEntriesArraySchema,
    getNameWithoutSpacesSchema,
    getOptionalStringSchema,
    getStringSchema,
    nodeSchema,
    workerCommandSchema,
} from '@schemas/common';
import { BasePluginType, PluginType } from '@typedefs/steps/deploymentStepTypes';
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

    optionalUri: z
        .union([
            z.literal(''),
            z
                .string()
                .min(2, 'Value must be at least 2 characters')
                .max(256, 'Value cannot exceed 256 characters')
                .regex(/^https?:\/\/.+/, 'Must be a valid URI'),
        ])
        .optional(),

    port: z.union([
        z.literal(''),
        z
            .number()
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(65535, 'Value cannot exceed 65535'),
    ]),

    ports: z
        .array(
            z.object({
                hostPort: z
                    .number()
                    .int('Value must be a whole number')
                    .min(1, 'Value must be at least 1')
                    .max(65535, 'Value cannot exceed 65535'),
                containerPort: z
                    .number()
                    .int('Value must be a whole number')
                    .min(1, 'Value must be at least 1')
                    .max(65535, 'Value cannot exceed 65535'),
            }),
        )
        .refine(
            (entries) => {
                const hostPorts = entries.map((entry) => entry.hostPort);
                return hostPorts.length === new Set(hostPorts).size;
            },
            {
                message: 'Duplicate host ports are not allowed',
            },
        )
        .default([]),

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
    customParams: getCustomParametersArraySchema(),
    pipelineParams: getKeyValueEntriesArraySchema(50),
    volumes: getKeyValueEntriesArraySchema(),
    fileVolumes: getFileVolumesArraySchema(50),

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

const createPortRequiredRefinement = () => {
    return (data: { [key: string]: any }) => {
        if (data.enableTunneling !== BOOLEAN_TYPES[0]) {
            return true; // Allow any value when tunneling is not enabled
        }

        return data.port !== '';
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
    port: {
        refine: createPortRequiredRefinement(),
        options: {
            message: 'Required when tunneling is enabled',
            path: ['port'],
        },
    },
};

// Helper functions to apply refinements
export const applyTunnelingRefinements = (schema) => {
    return schema
        .refine(tunnelingRefinements.tunnelingToken.refine, tunnelingRefinements.tunnelingToken.options)
        .refine(tunnelingRefinements.port.refine, tunnelingRefinements.port.options);
};

export const applyDeploymentTypeRefinements = (schema) => {
    return schema.superRefine((data, ctx) => {
        if (!data?.deploymentType) {
            return;
        }

        // Validate that crUsername and crPassword are provided when crVisibility is 'Private'
        if (data.deploymentType.pluginType === PluginType.Container && data.deploymentType.crVisibility === 'Private') {
            if (!data.deploymentType.crUsername) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Username is required',
                    path: ['deploymentType', 'crUsername'],
                });
            }
            if (!data.deploymentType.crPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Password/Authentication Token is required',
                    path: ['deploymentType', 'crPassword'],
                });
            }
        }

        // Validate that username and accessToken are provided when worker repositoryVisibility is 'private'
        if (data.deploymentType.pluginType === PluginType.Worker && data.deploymentType.repositoryVisibility === 'private') {
            if (!data.deploymentType.username) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Username is required for private repositories',
                    path: ['deploymentType', 'username'],
                });
            }
            if (!data.deploymentType.accessToken) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Access token is required for private repositories',
                    path: ['deploymentType', 'accessToken'],
                });
            }
        }
    });
};

export const applyCustomPluginSignatureRefinements = (schema) => {
    return schema.refine(
        (data) => {
            if (data.pluginSignature === PLUGIN_SIGNATURE_TYPES[PLUGIN_SIGNATURE_TYPES.length - 1]) {
                return typeof data.customPluginSignature === 'string' && data.customPluginSignature.trim() !== '';
            }
            return true;
        },
        {
            message: 'Required when plugin signature is CUSTOM',
            path: ['customPluginSignature'],
        },
    );
};

const baseDeploymentSchema = z.object({
    // Target Nodes
    autoAssign: z.boolean(),
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
    allowReplicationInTheWild: z.boolean(),

    // Tunneling
    enableTunneling: z.enum(BOOLEAN_TYPES, { required_error: 'Value is required' }),
    port: validations.port,
    tunnelingToken: getOptionalStringSchema(512),
    tunnelingLabel: z
        .union([
            z.literal(''),
            z
                .string()
                .min(3, 'Value must be at least 3 characters')
                .max(64, 'Value cannot exceed 64 characters')
                .regex(
                    /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
                    'Only letters, numbers and special characters allowed',
                ),
        ])
        .optional(),
});

const containerDeploymentTypeSchema = z.object({
    pluginType: z.literal(PluginType.Container),
    containerImage: validations.containerImage,
    containerRegistry: validations.containerRegistry,
    crVisibility: z.enum(CR_VISIBILITY_OPTIONS, { required_error: 'Value is required' }),
    crUsername: z.union([getStringSchema(3, 128), z.literal('')]).optional(),
    crPassword: z.union([getStringSchema(3, 256), z.literal('')]).optional(),
});

const workerDeploymentTypeSchema = z.object({
    pluginType: z.literal(PluginType.Worker),
    image: getStringSchema(3, 256),
    repositoryUrl: z
        .string({ required_error: 'Value is required' })
        .min(3, 'Value must be at least 3 characters')
        .max(512, 'Value cannot exceed 512 characters')
        .regex(/^https?:\/\/github\.com\/[^/\s]+\/[^/\s]+(?:\.git)?(?:\/.*)?$/i, 'Must be a valid GitHub repository URL'),
    repositoryVisibility: z.enum(['public', 'private'], { required_error: 'Value is required' }),
    username: z
        .string()
        .max(256, `Value cannot exceed 256 characters`)
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed')
        .optional(),
    accessToken: z
        .string()
        .max(512, `Value cannot exceed 512 characters`)
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed')
        .optional(),
    workerCommands: z.array(workerCommandSchema).refine(
        (workerCommand) => {
            const commands = workerCommand.map((item) => item.command?.trim()).filter((command) => command && command !== ''); // Only non-empty commands

            const uniqueCommands = new Set(commands);
            return uniqueCommands.size === commands.length;
        },
        {
            message: 'Duplicate commands are not allowed',
        },
    ),
});

export const deploymentTypeSchema = z.discriminatedUnion('pluginType', [
    containerDeploymentTypeSchema,
    workerDeploymentTypeSchema,
]);

const genericAppDeploymentSchemaWihtoutRefinements = baseDeploymentSchema.extend({
    jobAlias: validations.jobAlias,
    deploymentType: deploymentTypeSchema,
    ports: validations.ports,
    envVars: validations.envVars,
    dynamicEnvVars: validations.dynamicEnvVars,
    volumes: validations.volumes,
    fileVolumes: validations.fileVolumes,
    restartPolicy: validations.restartPolicy,
    imagePullPolicy: validations.imagePullPolicy,
});

export const genericAppDeploymentSchema = applyDeploymentTypeRefinements(
    applyTunnelingRefinements(genericAppDeploymentSchemaWihtoutRefinements),
);

// Plugins
const baseGenericPluginSchema = z.object({
    basePluginType: z.literal(BasePluginType.Generic),

    // Tunneling
    port: validations.port,
    enableTunneling: z.enum(BOOLEAN_TYPES, { required_error: 'Value is required' }),
    tunnelingToken: getOptionalStringSchema(512),

    // Ports
    ports: validations.ports,

    // Deployment type
    deploymentType: deploymentTypeSchema,

    // Variables
    envVars: validations.envVars,
    dynamicEnvVars: validations.dynamicEnvVars,
    volumes: validations.volumes,
    fileVolumes: validations.fileVolumes,

    // Policies
    restartPolicy: z.enum(POLICY_TYPES, { required_error: 'Value is required' }),
    imagePullPolicy: z.enum(POLICY_TYPES, { required_error: 'Value is required' }),
});

const genericPluginSchema = baseGenericPluginSchema;

const baseNativePluginSchema = z.object({
    basePluginType: z.literal(BasePluginType.Native),

    // Signature
    pluginSignature: validations.pluginSignature,
    customPluginSignature: getOptionalStringSchema(128),

    // Tunneling
    port: validations.port,
    enableTunneling: z.enum(BOOLEAN_TYPES, { required_error: 'Value is required' }),
    tunnelingToken: getOptionalStringSchema(512),

    // Custom Parameters
    customParams: validations.customParams,
});

const pluginSchemaWithoutRefinements = z.discriminatedUnion('basePluginType', [genericPluginSchema, baseNativePluginSchema]);

const pluginSchema = applyCustomPluginSignatureRefinements(
    applyDeploymentTypeRefinements(applyTunnelingRefinements(pluginSchemaWithoutRefinements)),
);

const nativeAppDeploymentSchemaWihtoutRefinements = baseDeploymentSchema.extend({
    jobAlias: validations.jobAlias,
    pluginSignature: validations.pluginSignature,
    customPluginSignature: getOptionalStringSchema(128),
    customParams: validations.customParams,
    pipelineParams: validations.pipelineParams,
    pipelineInputType: z.enum(PIPELINE_INPUT_TYPES, { required_error: 'Value is required' }),
    pipelineInputUri: validations.optionalUri,
    chainstoreResponse: validations.chainstoreResponse,
    plugins: z.array(pluginSchema).max(5, 'Only 5 plugins allowed').optional(),
});

export const nativeAppDeploymentSchema = applyCustomPluginSignatureRefinements(
    applyTunnelingRefinements(nativeAppDeploymentSchemaWihtoutRefinements),
);

const serviceAppDeploymentSchemaWihtoutRefinements = baseDeploymentSchema.extend({
    jobAlias: validations.jobAlias,
    enableTunneling: z.enum(BOOLEAN_TYPES, { required_error: 'Value is required' }),
    tunnelingToken: getOptionalStringSchema(512),
    inputs: validations.envVars,
    serviceReplica: nodeSchema.shape.address.optional(),
});

export const serviceAppDeploymentSchema = applyTunnelingRefinements(serviceAppDeploymentSchemaWihtoutRefinements);
