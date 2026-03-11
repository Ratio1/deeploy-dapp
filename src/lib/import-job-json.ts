import { jobSchema } from '@schemas/index';
import { parseImportedRunningJobEntry } from '@lib/import-running-job-json';
import { JobType } from '@typedefs/deeploys';
import { z } from 'zod';

type JobFormValues = z.infer<typeof jobSchema>;

const isRecord = (value: unknown): value is Record<string, any> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const toDraftLikePayload = (payload: Record<string, any>): Record<string, any> => {
    const normalized: Record<string, any> = {
        jobType: payload.jobType,
        specifications: payload.specifications,
        costAndDuration: payload.costAndDuration,
        deployment: payload.deployment,
    };

    if (payload.jobType === JobType.Service) {
        normalized.serviceId = payload.serviceId;
        normalized.tunnelURL = payload.tunnelURL;
    }

    // Native draft exports store plugins under deployment.plugins.
    if (payload.jobType === JobType.Native && payload.plugins === undefined) {
        const deployment = normalized.deployment;
        if (isRecord(deployment) && Array.isArray(deployment.plugins)) {
            normalized.plugins = deployment.plugins;
        }
    }

    return normalized;
};

export const parseImportedJobJson = (rawJson: string): JobFormValues => {
    let parsedJson: unknown;

    try {
        parsedJson = JSON.parse(rawJson);
    } catch (_error) {
        throw new Error('Invalid JSON file.');
    }

    if (!isRecord(parsedJson)) {
        throw new Error('Imported JSON must be an object.');
    }

    const directParse = jobSchema.safeParse(parsedJson);
    if (directParse.success) {
        return directParse.data;
    }

    const draftLikeParse = jobSchema.safeParse(toDraftLikePayload(parsedJson));
    if (draftLikeParse.success) {
        return draftLikeParse.data;
    }

    const runningEntryParse = (() => {
        try {
            return {
                success: true as const,
                data: parseImportedRunningJobEntry(parsedJson),
            };
        } catch (error) {
            return {
                success: false as const,
                error,
            };
        }
    })();

    if (runningEntryParse.success) {
        return runningEntryParse.data;
    }

    const issueMessage =
        (runningEntryParse.error instanceof Error ? runningEntryParse.error.message : undefined) ??
        draftLikeParse.error.issues[0]?.message ??
        directParse.error.issues[0]?.message ??
        'JSON does not match supported job formats.';
    throw new Error(`Invalid job JSON: ${issueMessage}`);
};
