import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { DependencyEdge } from '@lib/dependencyTree';
import { SlateCard } from '@shared/cards/SlateCard';
import DeeployErrorAlert from '@shared/jobs/DeeployErrorAlert';

type Props = {
    edges: DependencyEdge[];
    hasCycle: boolean;
};

export default function DependencyTreeView({ edges, hasCycle }: Props) {
    if (edges.length === 0) {
        return null;
    }

    return (
        <div className="col gap-4">
            <ConfigSectionTitle title="Plugin Dependencies" variant="purple" />

            <SlateCard>
                <div className="col gap-2">
                    {edges.map((edge, i) => (
                        <div key={i} className="row gap-2 text-sm">
                            <div className="font-medium text-slate-700">{edge.from}</div>
                            <div className="text-slate-400">&rarr;</div>
                            <div className="font-medium text-slate-700">{edge.to}</div>
                        </div>
                    ))}
                </div>
            </SlateCard>

            {hasCycle && (
                <DeeployErrorAlert
                    title="Circular Dependency"
                    description="A circular dependency was detected between plugins. Please remove cyclic references to proceed."
                />
            )}
        </div>
    );
}
