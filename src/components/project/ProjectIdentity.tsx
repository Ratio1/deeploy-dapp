import { Project } from '@typedefs/deeploys';

export default function ProjectIdentity({ project }: { project: Project }) {
    return (
        <div className="col gap-1">
            <div className="row gap-2">
                <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                <div className="text-xl font-semibold">{project.name}</div>
            </div>

            <div className="row gap-1.5 text-slate-500">
                <div className="text-sm font-medium">
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
