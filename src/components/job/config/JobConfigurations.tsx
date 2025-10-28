import { SelectItem } from '@heroui/select';
import { isGenericPlugin, NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS } from '@lib/deeploy-utils';
import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import StyledSelect from '@shared/StyledSelect';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import _, { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import JobDynamicEnvSection from '../JobDynamicEnvSection';
import JobFileVolumesSection from '../JobFileVolumesSection';
import JobKeyValueSection from '../JobKeyValueSection';
import JobSimpleTagsSection from '../JobSimpleTagsSection';
import ConfigCAR from './ConfigCAR';
import ConfigSectionTitle from './ConfigSectionTitle';
import ConfigWAR from './ConfigWAR';

type PluginConfig = {
    signature: string;
    value: JobConfig;
};

export default function JobConfigurations({ job }: { job: RunningJobWithResources }) {
    const tags = !job.jobTags ? [] : job.jobTags.filter((tag) => tag !== '');

    const pluginConfigs: PluginConfig[] = _(job.instances)
        .map((instance) => instance.plugins)
        .flatten()
        .map((plugin) => {
            return {
                signature: plugin.signature,
                value: plugin.instance_conf,
            };
        })
        .uniqBy('signature')
        .sortBy('signature')
        .value();

    const [pluginConfig, setPluginConfig] = useState<PluginConfig>(pluginConfigs[0]!);

    useEffect(() => {
        console.log('JobConfigurations', pluginConfig);
    }, [pluginConfig]);

    const config = pluginConfig.value;

    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="flex items-start justify-between">
                    <div className="text-lg font-semibold">Configurations</div>

                    <div className="w-[240px]">
                        <StyledSelect
                            selectedKeys={[pluginConfig.signature]}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0] as string;
                                setPluginConfig(pluginConfigs.find((config) => config.signature === selectedKey)!);
                            }}
                            placeholder="Select a plugin"
                        >
                            {pluginConfigs.map((item) => (
                                <SelectItem key={item.signature} textValue={item.signature}>
                                    <div className="row gap-2 py-1">
                                        <div className="font-medium">{item.signature}</div>
                                    </div>
                                </SelectItem>
                            ))}
                        </StyledSelect>
                    </div>
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

                    {/* Native Plugin */}
                    {!isGenericPlugin(pluginConfig.signature) && (
                        <>
                            <ConfigSectionTitle title="Native Plugin" variant="green" />

                            <ItemWithBoldValue
                                label="Custom Parameters"
                                value={
                                    <JobKeyValueSection
                                        obj={Object.fromEntries(
                                            Object.entries(pluginConfig.value)
                                                .filter(
                                                    ([key, _]) =>
                                                        !NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS.includes(key as keyof JobConfig),
                                                )
                                                .map(([key, value]) => [key, JSON.stringify(value)]),
                                        )}
                                        displayShortValues={false}
                                    />
                                }
                            />
                        </>
                    )}

                    {/* Worker App Runner */}
                    {pluginConfig.signature === 'WORKER_APP_RUNNER' && (
                        <ConfigWAR vcsData={config.VCS_DATA} commands={config.BUILD_AND_RUN_COMMANDS} image={config.IMAGE} />
                    )}

                    {/* Container App Runner */}
                    {pluginConfig.signature === 'CONTAINER_APP_RUNNER' && (
                        <ConfigCAR crData={config.CR_DATA} image={config.IMAGE} />
                    )}

                    {/* Service */}
                    {job.resources.jobType === JobType.Service && (
                        <>
                            <ConfigSectionTitle title="Service" variant="purple" />

                            <ItemWithBoldValue label="Image" value={config.IMAGE} />
                        </>
                    )}

                    {/* Port Mapping */}
                    {isGenericPlugin(pluginConfig.signature) && pluginConfig.value.CONTAINER_RESOURCES.ports && (
                        <>
                            <ConfigSectionTitle title="Port Mapping" />

                            <JobKeyValueSection
                                obj={pluginConfig.value.CONTAINER_RESOURCES.ports}
                                labels={['HOST', 'CONTAINER']}
                                displayShortValues={false}
                            />
                        </>
                    )}

                    {isGenericPlugin(pluginConfig.signature) && (
                        <>
                            {/* Variables */}
                            <ConfigSectionTitle title="Variables" />

                            <div className="col gap-3">
                                <div className="col gap-3">
                                    <ItemWithBoldValue
                                        label="ENV Variables"
                                        value={isEmpty(config.ENV) ? '—' : <JobKeyValueSection obj={config.ENV} />}
                                    />

                                    {job.resources.jobType !== JobType.Native && (
                                        <ItemWithBoldValue
                                            label="Dynamic ENV Variables"
                                            value={
                                                isEmpty(config.DYNAMIC_ENV) ? (
                                                    '—'
                                                ) : (
                                                    <JobDynamicEnvSection dynamicEnv={config.DYNAMIC_ENV} />
                                                )
                                            }
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ItemWithBoldValue
                                        label="Volumes"
                                        value={isEmpty(config.VOLUMES) ? '—' : <JobKeyValueSection obj={config.VOLUMES} />}
                                    />

                                    {(job.resources.jobType === JobType.Generic || isGenericPlugin(pluginConfig.signature)) && (
                                        <ItemWithBoldValue
                                            label="File Volumes"
                                            value={
                                                isEmpty(config.FILE_VOLUMES) ? (
                                                    '—'
                                                ) : (
                                                    <JobFileVolumesSection obj={config.FILE_VOLUMES} />
                                                )
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Policies */}
                            <ConfigSectionTitle title="Policies" />

                            <div className="grid grid-cols-2 gap-3">
                                <ItemWithBoldValue label="Restart Policy" value={config.RESTART_POLICY} capitalize />
                                <ItemWithBoldValue label="Image Pull Policy" value={config.IMAGE_PULL_POLICY} capitalize />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </BorderedCard>
    );
}
