import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import { SmallTag } from '@shared/SmallTag';
import { RunningProject } from '@typedefs/general';

export default function RunningProjectCard({ project }: { project: RunningProject }) {
    return (
        <BorderedCard>
            <div className="row justify-between gap-3 lg:gap-6">
                <div className="min-w-[168px]">
                    <CardItem label="Alias" value={<>{project.alias}</>} isBold />
                </div>

                <div className="min-w-[168px]">
                    <CardItem label="Plugin Signature" value={<>{project.pluginSignature}</>} />
                </div>

                <div className="min-w-[64px]">
                    <CardItem label="Nodes" value={<>{project.nodes}</>} />
                </div>

                <div className="min-w-[64px]">
                    <CardItem
                        label="GPU/CPU"
                        value={
                            <SmallTag variant={project.processor === 'GPU' ? 'green' : 'blue'}>{project.processor}</SmallTag>
                        }
                    />
                </div>

                <div className="min-w-[112px]">
                    <CardItem label="Running Nodes" value={<>{project.runningNodes}</>} />
                </div>

                <div className="min-w-[112px]">
                    <CardItem
                        label="Expiration Date"
                        value={
                            <>
                                {new Date(project.expiresAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </>
                        }
                    />
                </div>
            </div>
        </BorderedCard>
    );
}
