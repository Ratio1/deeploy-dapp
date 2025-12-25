'use client';

import { Skeleton } from '@heroui/skeleton';
import { useDraftProject } from '@lib/drafts/queries';
import { routePath } from '@lib/routes/route-paths';
import { getShortAddressOrHash } from '@lib/utils';
import { SmallTag } from '@shared/SmallTag';
import { useParams, usePathname } from 'next/navigation';

// To be used only inside a project/projectDraft route
export default function ProjectIdentity({ projectName }: { projectName?: string }) {
    const pathname = usePathname() ?? '';
    const { projectHash } = useParams<{ projectHash?: string }>();

    const isDraftRoute = pathname.includes(routePath.projectDraft);
    const { data: draft, isLoading: isDraftLoading } = useDraftProject(
        isDraftRoute ? projectHash : undefined,
        isDraftRoute,
    );

    if (!projectHash || isDraftLoading) {
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

                <SmallTag variant="green" isLarge>
                    Running
                </SmallTag>
            </div>
        );
    }

    if (pathname.includes(routePath.project) && !projectName) {
        return (
            <div className="row gap-1.5">
                <SmallTag isLarge>{getShortAddressOrHash(projectHash, 6)}</SmallTag>

                <SmallTag variant="green" isLarge>
                    Running
                </SmallTag>
            </div>
        );
    }

    return <div></div>;
}
