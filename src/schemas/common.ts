import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { z } from 'zod';

export const customContainerTypeValue = CONTAINER_TYPES[CONTAINER_TYPES.length - 1];
export const enabledBooleanTypeValue = BOOLEAN_TYPES[0];

export const keyValueEntrySchema = z
    .object({
        key: z.string().optional(),
        value: z.string().optional(),
    })
    .refine(
        (data) => {
            if (!data.key && !data.value) {
                return true; // Both empty = valid (empty row, will be ignored)
            }
            if (!data.key) {
                return false; // Key missing
            }
            return true; // Key present
        },
        {
            message: 'Key is required',
            path: ['key'],
        },
    )
    .refine(
        (data) => {
            if (!data.key && !data.value) {
                return true; // Both empty = valid (empty row, will be ignored)
            }
            if (!data.value) {
                return false; // Value missing
            }
            return true; // Value present
        },
        {
            message: 'Value is required',
            path: ['value'],
        },
    );

export const targetNodeEntrySchema = z.object({
    address: z
        .string()
        .max(52, 'Value cannot exceed 52 characters')
        .refine((val) => val === '' || /^0xai_[A-Za-z0-9_-]+$/.test(val), 'Must be a valid node address'),
});

export const dynamicEnvPairSchema = z.object({
    type: z.enum(DYNAMIC_ENV_TYPES),
    value: z
        .string()
        .max(128, 'Value cannot exceed 128 characters')
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Only letters, numbers and special characters allowed')
        .optional(),
});

// The key + the 3 key-value pairs
export const dynamicEnvEntrySchema = z
    .object({
        key: z.string().optional(),
        values: z.array(dynamicEnvPairSchema).length(3, 'Must have exactly 3 value pairs'),
    })
    .refine(
        (data) => {
            if (!data.key) {
                return true; // Empty entry is valid (will be ignored)
            }
            return true; // Key present
        },
        {
            message: 'Key is required',
            path: ['key'],
        },
    )
    .refine(
        (data) => {
            if (!data.key) {
                return true; // Empty entry is valid (will be ignored)
            }
            // Check if all values are empty
            const allValuesEmpty = data.values.every((pair) => !pair.value);
            if (allValuesEmpty) {
                return false; // If key is present, at least one value must be provided
            }
            return true;
        },
        {
            message: 'At least one value is required',
            path: ['values'],
        },
    );
