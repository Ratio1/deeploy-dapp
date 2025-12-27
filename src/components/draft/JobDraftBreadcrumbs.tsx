'use client';

import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { useDraftProject } from '@lib/drafts/queries';
import { routePath } from '@lib/routes/route-paths';
import { SmallTag } from '@shared/SmallTag';
import { Job } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobDraftBreadcrumbs({ jobDraft }: { jobDraft: Job }) {
    const { getProjectName, setProjectOverviewTab } = useDeploymentContext() as DeploymentContextType;
    const router = useRouter();

    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    const { data: projectDraft, isLoading: isProjectLoading } = useDraftProject(jobDraft.projectHash, true);

    useEffect(() => {
        if (jobDraft) {
            setJobTypeOption(JOB_TYPE_OPTIONS.find((option) => option.jobType === jobDraft.jobType));
        }
    }, [jobDraft]);

    if (isProjectLoading) {
        return <></>;
    }

    const targetPath = `${routePath.deeploys}/${!projectDraft ? routePath.project : routePath.projectDraft}/${jobDraft.projectHash}`;

    return (
        <div className="row gap-1.5">
            <Link
                href={targetPath}
                className="hover:underline"
                onClick={(event) => {
                    event.preventDefault();

                    if (!projectDraft) {
                        setProjectOverviewTab('draftJobs');
                    }

                    router.push(targetPath);
                }}
            >
                <div className="text-xl font-semibold">{projectDraft?.name ?? getProjectName(jobDraft.projectHash)}</div>
            </Link>

            <div className="mb-0.5 ml-1 text-xl font-semibold text-slate-500">/</div>

            <div className="row gap-1.5">
                {!!jobTypeOption && <div className={`text-xl ${jobTypeOption.textColorClass}`}>{jobTypeOption.icon}</div>}
                <div className="text-xl font-semibold">{jobDraft.deployment.jobAlias}</div>

                <SmallTag isLarge>Draft</SmallTag>
            </div>
        </div>
    );
}
