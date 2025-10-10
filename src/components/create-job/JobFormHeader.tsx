import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import db from '@lib/storage/db';
import { getShortAddressOrHash, isValidProjectHash } from '@lib/utils';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import { SmallTag } from '@shared/SmallTag';
import { DraftProject, JobType } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Props {
    steps: string[];
}

function JobFormHeader({ steps }: Props) {
    const { jobType, getProjectName } = useDeploymentContext() as DeploymentContextType;

    const { projectHash } = useParams();

    const [projectName, setProjectName] = useState<string | undefined>();

    // Only run the query if we have a valid ID
    const draft: DraftProject | undefined | null = useLiveQuery(
        isValidProjectHash(projectHash) ? () => db.projects.get(projectHash) : () => undefined,
        [isValidProjectHash, projectHash],
        null, // Default value returned while data is loading
    );

    useEffect(() => {
        if (projectHash) {
            setProjectName(getProjectName(projectHash));
        }
    }, [projectHash]);

    if (draft === null || !isValidProjectHash(projectHash)) {
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
