import { z } from 'zod';
import { FormType } from '../typedefs/deployment';
import { genericAppDeploymentSchema, nativeAppDeploymentSchema, serviceAppDeploymentSchema } from './steps/deployment';
import specificationsSchema from './steps/specifications';

const deeployAppBaseSchema = z.object({
    formType: z.enum([FormType.Generic, FormType.Native, FormType.Service]),
    specifications: specificationsSchema,
});

export const deeployAppSchema = z.discriminatedUnion('formType', [
    deeployAppBaseSchema.extend({
        formType: z.literal(FormType.Generic),
        deployment: genericAppDeploymentSchema,
    }),
    deeployAppBaseSchema.extend({
        formType: z.literal(FormType.Native),
        deployment: nativeAppDeploymentSchema,
    }),
    deeployAppBaseSchema.extend({
        formType: z.literal(FormType.Service),
        deployment: serviceAppDeploymentSchema,
    }),
]);
