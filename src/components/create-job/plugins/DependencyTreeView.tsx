import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { DependencyEdge } from '@lib/dependencyTree';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import DeeployErrorAlert from '@shared/jobs/DeeployErrorAlert';
import { RiArrowRightSLine, RiGitMergeLine } from 'react-icons/ri';
import { useMemo } from 'react';

type Props = {
    edges: DependencyEdge[];
    hasCycle: boolean;
};

export default function DependencyTreeView({ edges, hasCycle }: Props) {
    if (edges.length === 0) {
        return null;
    }

    const orderedEdges = useMemo(
        () =>
            [...edges].sort((a, b) => {
                const fromComparison = a.from.localeCompare(b.from);
                if (fromComparison !== 0) {
                    return fromComparison;
                }

                return a.to.localeCompare(b.to);
            }),
        [edges],
    );

    return (
        <div className="col gap-4">
            <ConfigSectionTitle title="Plugin Dependencies" variant="purple" />

            <SlateCard>
                <div className="col gap-3">
                    <SmallTag variant="purple">
                        <div className="row items-center gap-1">
                            <RiGitMergeLine className="text-sm" />
                            <div>{orderedEdges.length} dependencies</div>
                        </div>
                    </SmallTag>

                    <div className="col gap-2">
                        {orderedEdges.map((edge) => (
                            <div key={`${edge.from}->${edge.to}`} className="row flex-wrap items-center gap-1.5">
                                <SmallTag variant="teal">
                                    <div className="font-semibold">{edge.from}</div>
                                </SmallTag>

                                <span className="compact text-xs text-slate-500">depends on</span>

                                <SmallTag variant="violet">
                                    <div className="font-semibold">{edge.to}</div>
                                </SmallTag>
                            </div>
                        ))}
                    </div>
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
