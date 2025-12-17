'use client';

import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { SmallTag } from '@shared/SmallTag';
import { DraftJob, DraftProject } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobDraftBreadcrumbs({ jobDraft }: { jobDraft: DraftJob }) {
    const { getProjectName, setProjectOverviewTab } = useDeploymentContext() as DeploymentContextType;
    const router = useRouter();

    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    const projectDraft: DraftProject | undefined | null = useLiveQuery(
        () => db.projects.get(jobDraft.projectHash),
        [jobDraft],
        null, // Default value returned while data is loading
    );

    useEffect(() => {
        if (jobDraft) {
            setJobTypeOption(JOB_TYPE_OPTIONS.find((option) => option.jobType === jobDraft.jobType));
        }
    }, [jobDraft]);

    if (projectDraft === null) {
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
