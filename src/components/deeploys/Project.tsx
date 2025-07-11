import { Spinner } from '@heroui/spinner';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import type { Project } from '@typedefs/deployment';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Project() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isValidId = id && !isNaN(parseInt(id)) && isFinite(parseInt(id));

    // Only run the query if we have a valid ID
    const project: Project | undefined | null = useLiveQuery(
        isValidId ? () => db.projects.where('id').equals(parseInt(id)).first() : () => undefined,
        [isValidId, id],
        null, // Default value returned while data is loading
    );

    useEffect(() => {
        if (project === undefined) {
            navigate(routePath.notFound);
        }
    }, [project]);

    if (project === null) {
        return (
            <div className="center-all w-full flex-1">
                <Spinner />
            </div>
        );
    }

    if (project === undefined) {
        return <></>;
    }

    console.log('[Project]', project);

    return (
        <div className="col gap-2">
            <div className="row gap-2">
                <div className="mt-[1px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                <div className="text-lg font-semibold">{project.name}</div>
            </div>

            <div className="font-medium text-slate-500">
                {new Date(project.datetime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                })}
            </div>
        </div>
    );
}
