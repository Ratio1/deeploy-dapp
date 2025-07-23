import { z } from 'zod';
import { FormType } from '../typedefs/deeploys';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema } from './steps/deployment';
import { genericSpecificationsSchema, nativeSpecificationsSchema, serviceSpecificationsSchema } from './steps/specifications';

const jobBaseSchema = z.object({
    formType: z.enum([FormType.Generic, FormType.Native, FormType.Service]),
});

export const jobSchema = z.discriminatedUnion('formType', [
    jobBaseSchema.extend({
        formType: z.literal(FormType.Generic),
        specifications: genericSpecificationsSchema,
        deployment: genericAppDeploymentSchema,
    }),
    jobBaseSchema.extend({
        formType: z.literal(FormType.Native),
        specifications: nativeSpecificationsSchema,
        deployment: nativeAppDeploymentSchema,
    }),
    jobBaseSchema.extend({
        formType: z.literal(FormType.Service),
        specifications: serviceSpecificationsSchema,
        deployment: serviceAppDeploymentSchema,
    }),
]);
