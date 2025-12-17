import { Skeleton } from '@heroui/skeleton';
import { getTunnelByToken } from '@lib/api/tunnels';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { useQuery } from '@tanstack/react-query';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { isEmpty } from 'lodash';
import { RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import JobKeyValueSection from '../JobKeyValueSection';
import JobSimpleTagsSection from '../JobSimpleTagsSection';
import ConfigSectionTitle from './ConfigSectionTitle';

export default function JobDeploymentSection({ job }: { job: RunningJobWithResources }) {
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

    const tags = !job.jobTags ? [] : job.jobTags.filter((tag) => tag !== '');

    const config = job.config;

    const pipelineData = job.pipelineData;

    const shouldFetchTunnel = !!tunnelingSecrets && !!config.TUNNEL_ENGINE_ENABLED && !!config.CLOUDFLARE_TOKEN;

    const {
        data: tunnelUrl,
        isLoading: isLoadingTunnel,
        isFetching: isFetchingTunnel,
    } = useQuery({
        queryKey: ['tunnelByToken', config.CLOUDFLARE_TOKEN],
        queryFn: async () => {
            if (!tunnelingSecrets || !config.CLOUDFLARE_TOKEN) {
                return null;
            }
            const response = await getTunnelByToken(config.CLOUDFLARE_TOKEN, tunnelingSecrets);
            return response?.result?.metadata?.dns_name || null;
        },
        enabled: shouldFetchTunnel,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const isTunnelLoading = isLoadingTunnel || isFetchingTunnel;

    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="row justify-between">
                    <div className="text-lg font-semibold">Deployment</div>

                    {shouldFetchTunnel && isTunnelLoading ? (
                        <Skeleton className="min-h-[28px] w-[224px] rounded-lg" />
                    ) : tunnelUrl ? (
                        <CopyableValue value={tunnelUrl}>
                            <Link to={`https://${tunnelUrl}`} target="_blank" className="hover:opacity-70">
                                <div className="row text-primary gap-1">
                                    <div className="font-roboto-mono text-sm font-medium">{tunnelUrl}</div>
                                    <RiExternalLinkLine className="mb-px text-[17px]" />
                                </div>
                            </Link>
                        </CopyableValue>
                    ) : null}
                </div>

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

                                <ItemWithBoldValue
                                    label="Pipeline Parameters"
                                    value={
                                        isEmpty(job.pipelineParams) ? (
                                            '—'
                                        ) : (
                                            <JobKeyValueSection obj={job.pipelineParams} displayShortValues={false} />
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </BorderedCard>
    );
}
