import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { z } from 'zod';
import { JobType } from '../typedefs/deeploys';
import { costAndDurationSchema } from './steps/costAndDuration';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema } from './steps/deployment';
import { genericSpecificationsSchema, nativeSpecificationsSchema, serviceSpecificationsSchema } from './steps/specifications';

export const TARGET_NODES_REQUIRED_ERROR = 'All target nodes must be specified';

const jobBaseSchema = z.object({
    jobType: z.enum([JobType.Generic, JobType.Native, JobType.Service]),
    costAndDuration: costAndDurationSchema,
});

export const jobSchema = z
    .discriminatedUnion('jobType', [
        jobBaseSchema.extend({
            jobType: z.literal(JobType.Generic),
            specifications: genericSpecificationsSchema,
            deployment: genericAppDeploymentSchema,
        }),
        jobBaseSchema.extend({
            jobType: z.literal(JobType.Native),
            specifications: nativeSpecificationsSchema,
            deployment: nativeAppDeploymentSchema,
        }),
        jobBaseSchema.extend({
            jobType: z.literal(JobType.Service),
            specifications: serviceSpecificationsSchema,
            deployment: serviceAppDeploymentSchema,
        }),
    ])
    .refine(
        (data) => {
            // If auto-assignment is disabled, all nodes must be specified
            const autoAssign: boolean = data.deployment.autoAssign;
            const targetNodesCount: number = data.specifications.targetNodesCount;
            const targetNodesLength: number = data.deployment.targetNodes.filter(
                (node: { address: string }) => node.address !== '',
            ).length;

            return (autoAssign && targetNodesLength === 0) || (!autoAssign && targetNodesLength === targetNodesCount);
        },
        (_data) => ({
            message: TARGET_NODES_REQUIRED_ERROR,
            path: ['deployment', 'targetNodes'],
        }),
    )
    .refine(
        (data) => {
            // Port is optional if applicationType is 'Other' or if enableTunneling is 'True'
            const isPortOptional =
                data.specifications.applicationType === APPLICATION_TYPES[1] ||
                data.deployment.enableTunneling === BOOLEAN_TYPES[0];

            // If port is not optional, it must be provided
            if (!isPortOptional && !data.deployment.port) {
                return false;
            }

            return true;
        },
        (_data) => ({
            message: 'Value is required',
            path: ['deployment', 'port'],
        }),
    );
