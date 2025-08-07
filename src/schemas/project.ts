import { COLOR_TYPES } from '@data/colorTypes';
import z from 'zod';
import { getNameWithoutSpacesSchema } from './common';

export const projectSchema = z.object({
    name: getNameWithoutSpacesSchema(3, 36),
    color: z.enum(COLOR_TYPES.map((color) => color.hex) as [string, ...string[]]),
});
