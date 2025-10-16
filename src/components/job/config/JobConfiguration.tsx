import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import _, { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import JobDynamicEnvSection from '../JobDynamicEnvSection';
import JobFileVolumesSection from '../JobFileVolumesSection';
import JobKeyValueSection from '../JobKeyValueSection';
import JobSimpleTagsSection from '../JobSimpleTagsSection';
import ConfigSectionTitle from './ConfigSectionTitle';
import ConfigWAR from './ConfigWAR';

type PluginConfig = {
    signature: string;
    value: JobConfig;
};

export default function JobConfiguration({ job }: { job: RunningJobWithResources }) {
    const tags = !job.jobTags ? [] : job.jobTags.filter((tag) => tag !== '');

    const [pluginConfig, setPluginConfig] = useState<PluginConfig>({
        signature: job.instances[0].plugins[0].signature,
        value: job.instances[0].plugins[0].instance_conf,
    });

    useEffect(() => {
        const signatures = _(job.instances)
            .map((instance) => instance.plugins)
            .flatten()
            .map((plugin) => plugin.signature)
            .value();

        console.log('Signatures', signatures);
    }, [job]);

    const config = pluginConfig.value;

    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="text-lg font-semibold">Configuration</div>

                <div className="col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <ItemWithBoldValue label="Port" value={config.PORT} />

                        <ItemWithBoldValue
                            label="Tunnel Engine Enabled"
                            value={(!!config.TUNNEL_ENGINE_ENABLED).toString()}
                            capitalize
                        />

                        {!!config.TUNNEL_ENGINE_ENABLED && (
                            <>
                                <ItemWithBoldValue label="Tunnel Engine" value={config.TUNNEL_ENGINE ?? '—'} capitalize />
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
                            </>
                        )}

                        <ItemWithBoldValue label="Restart Policy" value={config.RESTART_POLICY} capitalize />
                        <ItemWithBoldValue label="Image Pull Policy" value={config.IMAGE_PULL_POLICY} capitalize />
                    </div>

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

                    {/* TODO: If plugin is of type WAR */}
                    {/* Worker App Runner */}
                    {!!config.VCS_DATA && (
                        <ConfigWAR vcsData={config.VCS_DATA} commands={config.BUILD_AND_RUN_COMMANDS} image={config.IMAGE} />
                    )}

                    {/* Container App Runner */}
                    {!!config.CR_DATA && (
                        <>
                            <ConfigSectionTitle title="Container App Runner" />

                            <div className="grid grid-cols-2 gap-3">
                                <ItemWithBoldValue
                                    label="Image"
                                    value={<CopyableValue value={config.IMAGE}>{config.IMAGE}</CopyableValue>}
                                />
                                <ItemWithBoldValue
                                    label="Container Registry"
                                    value={!config.CR_DATA.SERVER ? 'docker.io' : config.CR_DATA.SERVER}
                                />

                                {!!config.CR_DATA.USERNAME && !!config.CR_DATA.PASSWORD && (
                                    <>
                                        <ItemWithBoldValue
                                            label="Username"
                                            value={
                                                <CopyableValue value={config.CR_DATA.USERNAME}>
                                                    {config.CR_DATA.USERNAME}
                                                </CopyableValue>
                                            }
                                        />
                                        <ItemWithBoldValue
                                            label="Password"
                                            value={
                                                <CopyableValue value={config.CR_DATA.PASSWORD}>
                                                    <div className="font-roboto-mono font-medium">••••••</div>
                                                </CopyableValue>
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Service */}
                    {job.resources.jobType === JobType.Service && (
                        <>
                            <ConfigSectionTitle title="Service" />

                            <ItemWithBoldValue label="Image" value={config.IMAGE} />
                        </>
                    )}

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

                            {job.resources.jobType === JobType.Generic && (
                                <ItemWithBoldValue
                                    label="File Volumes"
                                    value={
                                        isEmpty(config.FILE_VOLUMES) ? '—' : <JobFileVolumesSection obj={config.FILE_VOLUMES} />
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BorderedCard>
    );
}
