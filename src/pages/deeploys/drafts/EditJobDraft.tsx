import DraftEditFormWrapper from '@components/draft/DraftEditFormWrapper';
import JobDraftBreadcrumbs from '@components/draft/JobDraftBreadcrumbs';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import db from '@lib/storage/db';
import { jobSchema } from '@schemas/index';
import ActionButton from '@shared/ActionButton';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, JobType } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiArrowLeftLine } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import z from 'zod';

export default function EditJobDraft() {
    const { setStep } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const { draftId } = useParams();

    const draftJob: DraftJob | undefined | null = useLiveQuery(
        draftId ? () => db.jobs.get(parseInt(draftId)) : () => undefined,
        [draftId],
        null, // Default value returned while data is loading
    );

    // Init
    useEffect(() => {
        setStep(0);
    }, []);

    const onSubmit = async (data: z.infer<typeof jobSchema>) => {
        if (!draftJob) {
            return;
        }

        try {
            const updatedJob = {
                ...draftJob,
                specifications: data.specifications,
                costAndDuration: data.costAndDuration,
                deployment: {
                    ...data.deployment,
                    jobAlias: data.deployment.jobAlias.toLowerCase(),
                },
            };

            if (data.jobType === JobType.Native) {
                updatedJob.deployment.plugins = data.plugins;
            }

            console.log('[EditJobDraft] onSubmit', updatedJob);

            const jobId = await db.jobs.update(draftJob.id, updatedJob as DraftJob);

            console.log('[EditJobDraft] Job draft updated successfully', jobId);
            toast.success('Job draft updated successfully.');

            navigate(-1);
        } catch (error) {
            console.error('[EditJobDraft] Error updating job draft:', error);
            toast.error('Failed to update job draft.');
        }
    };

    if (!draftJob) {
        return <></>;
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <JobDraftBreadcrumbs jobDraft={draftJob} />

                    <div className="row gap-2">
                        <ActionButton className="slate-button" color="default" onPress={() => navigate(-1)}>
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Cancel</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                <div className="col gap-6">
                    {/* Form */}
                    <DraftEditFormWrapper job={draftJob} onSubmit={onSubmit} />
                </div>
            </div>

            <SupportFooter />
        </div>
    );
}
