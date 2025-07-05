import { z } from 'zod';
import { FormType } from '../typedefs/deployment';
import deploymentSchema from './steps/deployment';
import specificationsSchema from './steps/specifications';

export const deeployAppSchema = z.object({
    formType: z.enum([FormType.Generic, FormType.Native, FormType.Service]),
    specifications: specificationsSchema,
    deployment: deploymentSchema,
});
