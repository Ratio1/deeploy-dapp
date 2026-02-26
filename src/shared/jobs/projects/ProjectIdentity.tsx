'use client';

import { Skeleton } from '@heroui/skeleton';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { getShortAddressOrHash } from '@lib/utils';
import { SmallTag } from '@shared/SmallTag';
import { DraftProject } from '@typedefs/deeploys';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export type ProjectRuntimeStatus = 'running' | 'degraded' | 'down';

// To be used only inside a project/projectDraft route
export default function ProjectIdentity({
    projectName,
    runtimeStatus = 'running',
}: {
    projectName?: string;
    runtimeStatus?: ProjectRuntimeStatus;
}) {
    const pathname = usePathname() ?? '';
    const { projectHash } = useParams<{ projectHash?: string }>();

    const [draft, setDraft] = useState<DraftProject | undefined>();

    useEffect(() => {
        if (projectHash && pathname.includes(routePath.projectDraft)) {
            fetchDraft(projectHash);
        }
    }, [pathname, projectHash]);

    const fetchDraft = async (projectHash: string) => {
        const draft = await db.projects.get(projectHash);
        setDraft(draft);
    };

    const runtimeTagVariant = runtimeStatus === 'down' ? 'red' : runtimeStatus === 'degraded' ? 'yellow' : 'green';
    const runtimeTagText = runtimeStatus === 'down' ? 'Down' : runtimeStatus === 'degraded' ? 'Degraded' : 'Running';

    if (!projectHash) {
        return <Skeleton className="min-h-10 w-40 rounded-lg" />;
    }

    if (draft) {
        return (
            <div className="col gap-0.5">
                <div className="row gap-2">
                    <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: draft.color }}></div>
                    <div className="text-xl font-semibold">{draft.name}</div>
                    <SmallTag isLarge>Draft</SmallTag>
                </div>

                <div className="row gap-1.5 text-slate-500">
                    <div className="compact">
                        {new Date(draft.createdAt).toLocaleString('en-US', {
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

    if (projectName) {
        return (
            <div className="row gap-1.5">
                <div className="text-xl font-semibold">{projectName}</div>

                <SmallTag variant={runtimeTagVariant} isLarge>
                    {runtimeTagText}
                </SmallTag>
            </div>
        );
    }

    if (pathname.includes(routePath.project) && !projectName) {
        return (
            <div className="row gap-1.5">
                <SmallTag isLarge>{getShortAddressOrHash(projectHash, 6)}</SmallTag>

                <SmallTag variant={runtimeTagVariant} isLarge>
                    {runtimeTagText}
                </SmallTag>
            </div>
        );
    }

    return <div></div>;
}
