import { z } from 'zod';
import { JobType } from '../typedefs/deeploys';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema } from './steps/deployment';
import { paymentAndDurationSchema } from './steps/paymentAndDuration';
import { genericSpecificationsSchema, nativeSpecificationsSchema, serviceSpecificationsSchema } from './steps/specifications';

const jobBaseSchema = z.object({
    jobType: z.enum([JobType.Generic, JobType.Native, JobType.Service]),
    paymentAndDuration: paymentAndDurationSchema,
});

export const jobSchema = z.discriminatedUnion('jobType', [
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
]);
