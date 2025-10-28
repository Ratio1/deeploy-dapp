import { SelectItem } from '@heroui/select';
import { isGenericPlugin } from '@lib/deeploy-utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import StyledSelect from '@shared/StyledSelect';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import _, { isEmpty } from 'lodash';
import { useState } from 'react';
import JobDynamicEnvSection from '../JobDynamicEnvSection';
import JobFileVolumesSection from '../JobFileVolumesSection';
import JobKeyValueSection from '../JobKeyValueSection';
import ConfigCAR from './ConfigCAR';
import ConfigNative from './ConfigNative';
import ConfigSectionTitle from './ConfigSectionTitle';
import ConfigWAR from './ConfigWAR';

type PluginConfig = {
    signature: string;
    value: JobConfig;
};

export default function JobPluginsSection({ job }: { job: RunningJobWithResources }) {
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

    // useEffect(() => {
    //     console.log('Plugin', pluginConfig);
    // }, [pluginConfig]);

    const config = pluginConfig.value;

    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="flex items-start justify-between">
                    <div className="text-lg font-semibold">Plugins</div>

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
                    {/* Native Plugin */}
                    {!isGenericPlugin(pluginConfig.signature) && <ConfigNative jobConfig={config} />}

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
                    {isGenericPlugin(pluginConfig.signature) && !isEmpty(pluginConfig.value.CONTAINER_RESOURCES.ports) && (
                        <>
                            <ConfigSectionTitle title="Port Mapping" />

                            <JobKeyValueSection
                                obj={pluginConfig.value.CONTAINER_RESOURCES.ports}
                                labels={['HOST', 'CONTAINER']}
                                displayShortValues={false}
                            />
                        </>
                    )}

                    {/* Variables & Policies */}
                    {isGenericPlugin(pluginConfig.signature) && (
                        <>
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
