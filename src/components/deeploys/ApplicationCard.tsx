import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import { SmallTag } from '@shared/SmallTag';
import { DeeployApp } from '@typedefs/general';

export default function ApplicationCard({ app }: { app: DeeployApp }) {
    return (
        <BorderedCard>
            <div className="row justify-between gap-3 lg:gap-6">
                <div className="min-w-[212px]">
                    <CardItem label="Version" value={<>{app.alias}</>} isBold />
                </div>

                <div className="min-w-[212px]">
                    <CardItem label="Plugin Signature" value={<>{app.pluginSignature}</>} />
                </div>

                <div className="min-w-[92px]">
                    <CardItem label="Nodes" value={<>{app.nodes}</>} />
                </div>

                <div className="min-w-[92px]">
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
                        label="Expiration Date"
                        value={
                            <>
                                {new Date(app.expiresAt).toLocaleDateString('en-US', {
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
