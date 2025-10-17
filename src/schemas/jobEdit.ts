import { JobType } from '@typedefs/deeploys';
import z from 'zod';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema } from './steps/deployment';

const jobBaseSchema = z.object({
    jobType: z.enum([JobType.Generic, JobType.Native, JobType.Service]),
});

export const deploymentSchema = z.discriminatedUnion('jobType', [
    jobBaseSchema.extend({
        jobType: z.literal(JobType.Generic),
        deployment: genericAppDeploymentSchema,
    }),
    jobBaseSchema.extend({
        jobType: z.literal(JobType.Native),
        deployment: nativeAppDeploymentSchema,
    }),
    jobBaseSchema.extend({
        jobType: z.literal(JobType.Service),
        deployment: serviceAppDeploymentSchema,
    }),
]);
