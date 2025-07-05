import { z } from 'zod';
import { FormType } from '../typedefs/deployment';
import { genericAppDeploymentSchemaWithRefinements } from './steps/deployment';
import specificationsSchema from './steps/specifications';

const deeployAppBaseSchema = z.object({
    specifications: specificationsSchema,
});

export const deeployAppSchema = z.discriminatedUnion('formType', [
    deeployAppBaseSchema.extend({
        formType: z.literal(FormType.Generic),
        deployment: genericAppDeploymentSchemaWithRefinements,
    }),
    deeployAppBaseSchema.extend({
        formType: z.literal(FormType.Native),
        deployment: genericAppDeploymentSchemaWithRefinements,
    }), // TODO: Add NATIVE/SERVICE deployment schemas here
    deeployAppBaseSchema.extend({
        formType: z.literal(FormType.Service),
        deployment: genericAppDeploymentSchemaWithRefinements,
    }), // TODO: Add NATIVE/SERVICE deployment schemas here
]);
