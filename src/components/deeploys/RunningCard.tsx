import { routePath } from '@lib/routes/route-paths';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import { SmallTag } from '@shared/SmallTag';
import { Job, RunningProject } from '@typedefs/deeploys';
import { useState } from 'react';
import { RiArrowRightSLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function RunningCard({
    project,
    expanded,
    toggle,
}: {
    project: RunningProject;
    expanded: boolean | undefined;
    toggle: () => void;
}) {
    const [earliestPaymentJob, setEarliestPaymentJob] = useState<Job | undefined>();

    return (
        <Link to={`${routePath.deeploys}/${routePath.project}/${project.projectHash}`}>
            <BorderedCard isHoverable>
                <div className="row justify-between gap-6">
                    <div className="row gap-6">
                        <CardItem
                            label="Project ID"
                            value={
                                <div className="row gap-2">
                                    <div
                                        className="-m-1 rounded-md p-1 hover:bg-slate-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            toggle();
                                        }}
                                    >
                                        <RiArrowRightSLine
                                            className={`text-[22px] text-slate-400 transition-all ${expanded ? 'rotate-90' : ''}`}
                                        />
                                    </div>

                                    <SmallTag>{project.projectHash}</SmallTag>
                                </div>
                            }
                        />
                    </div>
                </div>
            </BorderedCard>
        </Link>
    );
}
