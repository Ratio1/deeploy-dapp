import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { z } from 'zod';

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

// Schema for array of key-value entries with duplicate key validation
export const getKeyValueEntriesArraySchema = (maxEntries?: number) => {
    let schema = z.array(keyValueEntrySchema);

    if (maxEntries) {
        schema = schema.max(maxEntries, `Maximum ${maxEntries} entries allowed`);
    }

    return schema.refine(
        (entries) => {
            const keys = entries.map((entry) => entry.key?.trim()).filter((key) => key && key !== ''); // Only non-empty keys

            const uniqueKeys = new Set(keys);
            return uniqueKeys.size === keys.length;
        },
        {
            message: 'Duplicate keys are not allowed',
        },
    );
};

export const nodeSchema = z.object({
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
            // If key is empty and all values are empty, it's a valid empty entry
            if (!data.key && data.values.every((pair) => !pair.value)) {
                return true;
            }
            // If key is present, it's valid
            if (data.key) {
                return true;
            }
            // Key is missing but some values are present
            return false;
        },
        {
            message: 'Key is required when values are provided',
            path: ['key'],
        },
    )
    .refine(
        (data) => {
            // If key is empty, don't validate values
            if (!data.key) {
                return true;
            }
            // Check if any value is missing when key is present
            const hasEmptyValue = data.values.some((pair) => !pair.value);
            return !hasEmptyValue;
        },
        {
            message: 'All values are required when key is provided',
            path: ['values'],
        },
    )
    // Individual value refinements for specific error paths
    .refine(
        (data) => {
            if (!data.key) return true;
            return data.values[0]?.value || false;
        },
        {
            message: 'Value is required',
            path: ['values', 0, 'value'],
        },
    )
    .refine(
        (data) => {
            if (!data.key) return true;
            return data.values[1]?.value || false;
        },
        {
            message: 'Value is required',
            path: ['values', 1, 'value'],
        },
    )
    .refine(
        (data) => {
            if (!data.key) return true;
            return data.values[2]?.value || false;
        },
        {
            message: 'Value is required',
            path: ['values', 2, 'value'],
        },
    );

export const getStringSchema = (minLength: number, maxLength: number) => {
    return z
        .string()
        .min(minLength, `Value must be at least ${minLength} characters`)
        .max(maxLength, `Value cannot exceed ${maxLength} characters`)
        .refine(
            (val) => val === '' || /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/.test(val),
            'Only letters, numbers and special characters allowed',
        );
};

export const getStringWithSpacesSchema = (minLength: number, maxLength: number) => {
    return z
        .string()
        .min(minLength, `Value must be at least ${minLength} characters`)
        .max(maxLength, `Value cannot exceed ${maxLength} characters`)
        .regex(
            /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
            'Only letters, numbers, spaces and special characters allowed',
        );
};

export const workerCommandSchema = z.object({
    command: getStringWithSpacesSchema(2, 512),
});
