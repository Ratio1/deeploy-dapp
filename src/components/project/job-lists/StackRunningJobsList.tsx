import { routePath } from '@lib/routes/route-paths';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import _ from 'lodash';
import Link from 'next/link';
import { RiStackLine } from 'react-icons/ri';

const widthClasses = [
    'min-w-[194px]', // alias
    'min-w-[140px]', // containers
    'min-w-[110px]', // target nodes
    'min-w-[260px]', // members
];

type StackGroup = {
    stackId: string;
    stackAlias: string;
    members: RunningJobWithResources[];
};

export default function StackRunningJobsList({ jobs }: { jobs: RunningJobWithResources[] }) {
    const groups = _(jobs)
        .filter((job) => !!job.stack?.stackId)
        .groupBy((job) => job.stack!.stackId)
        .map((members, stackId) => ({
            stackId,
            stackAlias: members[0].stack?.stackAlias || stackId,
            members,
        }))
        .value() as StackGroup[];

    return (
        <CompactCustomCard
            header={
                <div className="row justify-between">
                    <div className="row min-h-[28px] gap-2">
                        <div className="row gap-1.5">
                            <RiStackLine className="text-lg text-cyan-600" />
                            <div className="compact">Stacks</div>
                        </div>

                        <div className="center-all bg-light h-5 w-5 rounded-full">
                            <div className="text-xs font-medium text-slate-600">{groups.length}</div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="row justify-between gap-2 px-4 py-3 text-[13px] font-medium text-slate-500">
                <div className={widthClasses[0]}>Alias</div>
                <div className={widthClasses[1]}>Containers</div>
                <div className={widthClasses[2]}>Target Nodes</div>
                <div className={widthClasses[3]}>Members</div>
                <div className="min-w-[32px]"></div>
            </div>

            {groups.map((group, index) => {
                const targetNodes = Number(group.members[0].numberOfNodesRequested);
                const memberAliases = group.members.map((member) => member.stack?.containerAlias || member.alias).join(', ');

                return (
                    <div key={`${group.stackId}-${index}`} className="row justify-between gap-2 border-t-2 border-slate-200/65 px-4 py-3 text-sm">
                        <div className={widthClasses[0]}>
                            <Link href={`${routePath.deeploys}/${routePath.stack}/${group.stackId}`} className="hover:opacity-75">
                                <SmallTag variant="cyan">
                                    <div className="max-w-[180px] truncate">{group.stackAlias}</div>
                                </SmallTag>
                            </Link>
                        </div>

                        <div className={widthClasses[1]}>
                            {group.members.length} container{group.members.length > 1 ? 's' : ''}
                        </div>

                        <div className={widthClasses[2]}>
                            {targetNodes} node{targetNodes > 1 ? 's' : ''}
                        </div>

                        <div className={widthClasses[3]}>
                            <div className="max-w-[260px] truncate text-[13px]">{memberAliases}</div>
                        </div>

                        <div className="min-w-[32px]"></div>
                    </div>
                );
            })}
        </CompactCustomCard>
    );
}
