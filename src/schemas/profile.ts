import z from 'zod';
import { getOptionalStringWithSpacesSchema, getStringSchema } from './common';

export const buildPublicProfileSchema = (brandingPlatforms: string[]) => {
    const shape: Record<string, z.ZodType> = {};

    for (const platform of brandingPlatforms) {
        shape[platform] = z.union([z.literal(''), z.string().url({ message: 'Must be a valid https URL' })]);
    }

    return z.object({
        name: getStringSchema(3, 32),
        description: getOptionalStringWithSpacesSchema(0, 80),
        links: z.object(shape),
    });
};
