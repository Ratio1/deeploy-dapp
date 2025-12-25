'use client';

import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { useDraftProject } from '@lib/drafts/queries';
import { getShortAddressOrHash, isValidProjectHash } from '@lib/utils';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import { SmallTag } from '@shared/SmallTag';
import { JobType } from '@typedefs/deeploys';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function JobFormHeader({ steps }: { steps: string[] }) {
    const { jobType, getProjectName } = useDeploymentContext() as DeploymentContextType;

    const { projectHash } = useParams<{ projectHash?: string }>();
    const isValidHash = isValidProjectHash(projectHash);

    const [projectName, setProjectName] = useState<string | undefined>();

    const { data: draft, isLoading: isDraftLoading } = useDraftProject(projectHash, isValidHash);

    useEffect(() => {
        if (projectHash) {
            setProjectName(getProjectName(projectHash));
        }
    }, [getProjectName, projectHash]);

    if (isDraftLoading || !draft || !isValidHash) {
        return (
            <div className="col w-full gap-8">
                <Skeleton className="min-h-[82.5px] w-full rounded-lg" />
                <Skeleton className="min-h-[50px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <JobFormHeaderInterface steps={steps}>
            <div className="row justify-between">
                {projectName ? (
                    <div className="big-title max-w-[280px] truncate">{projectName}</div>
                ) : draft !== undefined ? (
                    <div className="row gap-2">
                        <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: draft.color }}></div>
                        <div className="big-title max-w-[280px] truncate">{draft.name}</div>
                    </div>
                ) : (
                    <SmallTag isLarge>{getShortAddressOrHash(projectHash, 6)}</SmallTag>
                )}

                <div className="big-title">
                    Add a {jobType} {jobType === JobType.Service ? '' : 'App'} Job
                </div>
            </div>
        </JobFormHeaderInterface>
    );
}

export default JobFormHeader;
