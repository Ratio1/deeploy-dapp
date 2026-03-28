import { JobType } from '@typedefs/deeploys';
import z from 'zod';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema, stackAppDeploymentSchema } from './steps/deployment';

const jobBaseSchema = z.object({
    jobType: z.enum([JobType.Generic, JobType.Native, JobType.Service, JobType.Stack]),
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
    jobBaseSchema.extend({
        jobType: z.literal(JobType.Stack),
        deployment: stackAppDeploymentSchema,
    }),
]);
