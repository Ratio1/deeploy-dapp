import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import z from 'zod';
import { getOptionalStringSchema } from './common';
import {
    applyDeploymentTypeRefinements,
    applyTunnelingRefinements,
    deploymentTypeSchema,
    validations,
} from './steps/deployment';

const basePluginSchema = z.object({
    // Base
    port: validations.port,
    enableTunneling: z.enum(BOOLEAN_TYPES, { required_error: 'Value is required' }),
    tunnelingToken: getOptionalStringSchema(512),

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

export const secondaryPluginSchema = applyDeploymentTypeRefinements(applyTunnelingRefinements(basePluginSchema));
