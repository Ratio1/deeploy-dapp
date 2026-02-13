import { jobSchema } from '@schemas/index';
import { JobType } from '@typedefs/deeploys';
import { z } from 'zod';

export type RecoveredJobPrefill = {
    projectHash: string;
    jobType: JobType;
    serviceId?: number;
    formValues: Partial<z.infer<typeof jobSchema>>;
    sourceJobId: string;
    pipelineCid?: string;
    projectNameHint?: string;
};
