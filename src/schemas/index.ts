import { z } from 'zod';
import { JobType } from '../typedefs/deeploys';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema } from './steps/deployment';
import { paymentAndDurationSchema } from './steps/paymentAndDuration';
import { genericSpecificationsSchema, nativeSpecificationsSchema, serviceSpecificationsSchema } from './steps/specifications';

const jobBaseSchema = z.object({
    jobType: z.enum([JobType.Generic, JobType.Native, JobType.Service]),
    paymentAndDuration: paymentAndDurationSchema,
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
            const targetNodesCount = data.specifications.targetNodesCount;
            const targetNodesLength = data.deployment.targetNodes.filter(
                (node: { address: string }) => node.address !== '',
            ).length;

            return targetNodesLength === 0 || targetNodesLength === targetNodesCount;
        },
        (data) => ({
            message: `All ${data.specifications.targetNodesCount} target nodes must be specified`,
            path: ['deployment', 'targetNodes'],
        }),
    );
