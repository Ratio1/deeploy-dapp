import { z } from 'zod';
import { FormType } from '../typedefs/deployment';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema } from './steps/deployment';
import specificationsSchema from './steps/specifications';

const jobBaseSchema = z.object({
    formType: z.enum([FormType.Generic, FormType.Native, FormType.Service]),
    specifications: specificationsSchema,
});

export const jobSchema = z.discriminatedUnion('formType', [
    jobBaseSchema.extend({
        formType: z.literal(FormType.Generic),
        deployment: genericAppDeploymentSchema,
    }),
    jobBaseSchema.extend({
        formType: z.literal(FormType.Native),
        deployment: nativeAppDeploymentSchema,
    }),
    jobBaseSchema.extend({
        formType: z.literal(FormType.Service),
        deployment: serviceAppDeploymentSchema,
    }),
]);
