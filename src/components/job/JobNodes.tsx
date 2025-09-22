import { getShortAddressOrHash } from '@lib/utils';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import { R1Address } from '@typedefs/blockchain';
import { RiTimeLine } from 'react-icons/ri';

export default function JobNodes({
    nodes,
    lastNodesChangeTimestamp,
}: {
    nodes: R1Address[];
    lastNodesChangeTimestamp: bigint;
}) {
    return (
        <CompactCustomCard
            header={
                <div className="row gap-2">
                    <div className="compact">Active Nodes</div>

                    <div className="center-all bg-light h-5 w-5 rounded-full">
                        <div className="text-xs font-medium text-slate-600">{nodes.length}</div>
                    </div>
                </div>
            }
            footer={
                <div className="row compact justify-between text-slate-600">
                    <div className="row gap-1">
                        <RiTimeLine className="text-lg" />
                        <div>Last Change Timestamp</div>
                    </div>

                    <div>
                        {!lastNodesChangeTimestamp ? 'N/A' : new Date(Number(lastNodesChangeTimestamp) * 1000).toLocaleString()}
                    </div>
                </div>
            }
        >
            <div className="row flex-wrap gap-4 px-4 py-3">
                {nodes.map((node) => {
                    return (
                        <CopyableValue key={node} value={node}>
                            <SmallTag isLarge>{getShortAddressOrHash(node, 4)}</SmallTag>
                        </CopyableValue>
                    );
                })}
            </div>
        </CompactCustomCard>
    );
}
