import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { isEmpty } from 'lodash';
import JobSimpleTagsSection from '../JobSimpleTagsSection';
import ConfigSectionTitle from './ConfigSectionTitle';

export default function JobDeploymentSection({ job }: { job: RunningJobWithResources }) {
    const tags = !job.jobTags ? [] : job.jobTags.filter((tag) => tag !== '');

    const config = job.config;

    const pipelineData = job.pipelineData;

    console.log('Pipeline Data', pipelineData);

    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="text-lg font-semibold">Deployment</div>

                <div className="col gap-4">
                    {/* Nodes */}
                    <ConfigSectionTitle title="Nodes" />

                    <div className="grid grid-cols-2 gap-3">
                        <ItemWithBoldValue label="Target Nodes" value={Number(job.numberOfNodesRequested)} />
                        <ItemWithBoldValue
                            label="Node Tags"
                            value={!tags.length ? '—' : <JobSimpleTagsSection array={tags} />}
                        />

                        <ItemWithBoldValue
                            label="Spare Nodes"
                            value={
                                !job.spareNodes || isEmpty(job.spareNodes) ? (
                                    '—'
                                ) : (
                                    <JobSimpleTagsSection
                                        array={job.spareNodes.map((addr) => getShortAddressOrHash(addr, 8, true) as string)}
                                        type="col"
                                        copyable
                                    />
                                )
                            }
                        />
                    </div>

                    {/* Tunneling */}
                    <ConfigSectionTitle title="Tunneling" />

                    <div className="grid grid-cols-2 gap-3">
                        <ItemWithBoldValue
                            label="Tunnel Engine Enabled"
                            value={(!!config.TUNNEL_ENGINE_ENABLED).toString()}
                            capitalize
                        />

                        <ItemWithBoldValue label="Port" value={config.PORT ? config.PORT.toString() : '—'} />

                        {!!config.TUNNEL_ENGINE_ENABLED && (
                            <>
                                <ItemWithBoldValue label="Tunnel Engine" value={config.TUNNEL_ENGINE ?? '—'} capitalize />

                                {config.TUNNEL_ENGINE === 'cloudflare' ? (
                                    <ItemWithBoldValue
                                        label="Cloudflare Token"
                                        value={
                                            config.CLOUDFLARE_TOKEN ? (
                                                <CopyableValue value={config.CLOUDFLARE_TOKEN}>
                                                    {getShortAddressOrHash(config.CLOUDFLARE_TOKEN, 4, false)}
                                                </CopyableValue>
                                            ) : (
                                                '—'
                                            )
                                        }
                                    />
                                ) : (
                                    <ItemWithBoldValue
                                        label="NGROK Auth Token"
                                        value={
                                            config.NGROK_AUTH_TOKEN ? (
                                                <CopyableValue value={config.NGROK_AUTH_TOKEN}>
                                                    {getShortAddressOrHash(config.NGROK_AUTH_TOKEN, 4, false)}
                                                </CopyableValue>
                                            ) : (
                                                '—'
                                            )
                                        }
                                    />
                                )}

                                {config.NGROK_EDGE_LABEL && (
                                    <ItemWithBoldValue label="Tunneling Label" value={config.NGROK_EDGE_LABEL} />
                                )}
                            </>
                        )}
                    </div>

                    {/* Pipeline */}
                    {job.resources.jobType === JobType.Native && (
                        <>
                            <ConfigSectionTitle title="Pipeline" />

                            <div className="grid grid-cols-2 gap-3">
                                <ItemWithBoldValue label="Pipeline Input Type" value={pipelineData.TYPE} />
                                <ItemWithBoldValue label="Pipeline Input URI" value={pipelineData.URL ?? '—'} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </BorderedCard>
    );
}
