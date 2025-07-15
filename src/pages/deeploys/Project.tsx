import ProjectOverview from '@components/project/ProjectOverview';
import ProjectPayment from '@components/project/ProjectPayment';
import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidId } from '@lib/utils';
import { Job, type Project } from '@typedefs/deployment';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import JobFormWrapper from '../../components/job/JobFormWrapper';

export default function Project() {
    const { formType } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { id } = useParams();

    // Only run the query if we have a valid ID
    const project: Project | undefined | null = useLiveQuery(
        isValidId(id) ? () => db.projects.get(parseInt(id as string)) : () => undefined,
        [isValidId, id],
        null, // Default value returned while data is loading
    );

    const jobs: Job[] | undefined = useLiveQuery(
        project ? () => db.jobs.where('projectId').equals(project.id).toArray() : () => undefined,
        [project],
    );

    useEffect(() => {
        if (project === undefined) {
            navigate(routePath.notFound);
        }
    }, [project]);

    useEffect(() => {
        console.log('[Project] pathname', pathname);
    }, [pathname]);

    if (project === null) {
        return (
            <div className="col w-full flex-1 gap-6">
                <div className="row w-full justify-between">
                    <Skeleton className="min-h-[52px] w-full max-w-[220px] rounded-lg" />
                    <Skeleton className="min-h-[52px] w-full max-w-[330px] rounded-lg" />
                </div>

                <Skeleton className="min-h-[88px] w-full rounded-lg" />
                <Skeleton className="min-h-[108px] w-full rounded-lg" />
            </div>
        );
    }

    if (project === undefined) {
        return <></>;
    }

    return !formType ? (
        <>
            {pathname.includes(routePath.payment) ? (
                <ProjectPayment project={project} jobs={jobs} />
            ) : (
                <ProjectOverview project={project} jobs={jobs} />
            )}
        </>
    ) : (
        <JobFormWrapper />
    );
}
