import { SmallTag } from '@shared/SmallTag';
import { DeeployApp } from '@typedefs/general';
import { BorderedCard } from './BorderedCard';
import { CardItem } from './CardItem';

export default function AppCard({ app }: { app: DeeployApp }) {
    return (
        <BorderedCard isHoverable>
            <div className="row justify-between gap-3 lg:gap-6">
                <div className="min-w-[212px]">
                    <CardItem label="Version" value={<>{app.alias}</>} isBold />
                </div>

                <div className="min-w-[212px]">
                    <CardItem label="Plugin Signature" value={<>{app.pluginSignature}</>} />
                </div>

                <div className="min-w-[64px]">
                    <CardItem label="Nodes" value={<>{app.nodes}</>} />
                </div>

                <div className="min-w-[82px]">
                    <CardItem
                        label="GPU/CPU"
                        value={<SmallTag variant={app.processor === 'GPU' ? 'green' : 'blue'}>{app.processor}</SmallTag>}
                    />
                </div>

                <div className="min-w-[112px]">
                    <CardItem label="Running Nodes" value={<>{app.runningNodes}</>} />
                </div>

                <div className="min-w-[112px]">
                    <CardItem
                        label="Deadline"
                        value={
                            <>
                                {new Date(app.deadline).toLocaleDateString('en-US', {
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
