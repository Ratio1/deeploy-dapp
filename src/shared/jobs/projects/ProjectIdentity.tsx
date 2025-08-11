import { Skeleton } from '@heroui/skeleton';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { getShortAddressOrHash, isValidProjectHash } from '@lib/utils';
import { SmallTag } from '@shared/SmallTag';
import { DraftProject } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// To be used only inside a project/draft route
export default function ProjectIdentity() {
    const { pathname } = useLocation();
    const { projectHash } = useParams();

    const [project, setProject] = useState<DraftProject | undefined>();

    useEffect(() => {
        if (projectHash) {
            if (pathname.includes(routePath.draft)) {
                fetchProject(projectHash);
            }
        }
    }, [pathname, projectHash]);

    const fetchProject = async (projectHash: string) => {
        const project = await db.projects.get(projectHash);
        setProject(project);
    };

    if (!isValidProjectHash(projectHash)) {
        return <Skeleton className="min-h-10 w-40 rounded-lg" />;
    }

    return !project ? (
        <div className="row gap-1.5">
            <SmallTag isLarge>{getShortAddressOrHash(projectHash, 6)}</SmallTag>
            <SmallTag variant="green" isLarge>
                Running
            </SmallTag>
        </div>
    ) : (
        <div className="col gap-0.5">
            <div className="row gap-2">
                <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                <div className="text-xl font-semibold">{project.name}</div>
                <SmallTag isLarge>Draft</SmallTag>
            </div>

            <div className="row gap-1.5 text-slate-500">
                <div className="compact">
                    {new Date(project.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    })}
                </div>
            </div>
        </div>
    );
}
