import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { JobConfig } from '@typedefs/deeployApi';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { isEmpty } from 'lodash';
import JobDynamicEnvSection from './JobDynamicEnvSection';
import JobKeyValueSection from './JobKeyValueSection';
import JobSimpleTagsSection from './JobSimpleTagsSection';

export default function JobConfiguration({ job }: { job: RunningJobWithResources }) {
    const config: JobConfig = job.config;

    console.log('JobConfiguration', { job });

    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="text-lg font-semibold">Configuration</div>

                <div className="col gap-4">
                    <div className="grid grid-cols-3 gap-4">
                        <ItemWithBoldValue label="Image" value={config.IMAGE} />
                        <ItemWithBoldValue label="Nodes" value={job.nodes.length} />

                        {!!config.VCS_DATA && <ItemWithBoldValue label="Repository" value={config.VCS_DATA.REPO_NAME} />}

                        <ItemWithBoldValue label="Port" value={config.PORT} />
                        <ItemWithBoldValue label="Tunnel Engine" value={config.TUNNEL_ENGINE} capitalize />
                        <ItemWithBoldValue
                            label="Tunnel Engine Enabled"
                            value={config.TUNNEL_ENGINE_ENABLED.toString()}
                            capitalize
                        />

                        {/* <ItemWithBoldValue label="NGROK Use API" value={config.NGROK_USE_API.toString()} capitalize /> */}

                        <ItemWithBoldValue
                            label="Cloudflare Token"
                            value={
                                config.CLOUDFLARE_TOKEN ? (
                                    <CopyableValue value={config.CLOUDFLARE_TOKEN}>
                                        {getShortAddressOrHash(config.CLOUDFLARE_TOKEN, 6, false)}
                                    </CopyableValue>
                                ) : (
                                    '—'
                                )
                            }
                        />
                        <ItemWithBoldValue label="Restart Policy" value={config.RESTART_POLICY} capitalize />
                        <ItemWithBoldValue label="Image Pull Policy" value={config.IMAGE_PULL_POLICY} capitalize />
                    </div>

                    <ItemWithBoldValue
                        label="ENV Variables"
                        value={isEmpty(config.ENV) ? '—' : <JobKeyValueSection obj={config.ENV} />}
                    />

                    <ItemWithBoldValue
                        label="Volumes"
                        value={isEmpty(config.VOLUMES) ? '—' : <JobKeyValueSection obj={config.VOLUMES} />}
                    />

                    <ItemWithBoldValue
                        label="Dynamic ENV Variables"
                        value={isEmpty(config.DYNAMIC_ENV) ? '—' : <JobDynamicEnvSection dynamicEnv={config.DYNAMIC_ENV} />}
                    />

                    {!!config.BUILD_AND_RUN_COMMANDS && (
                        <ItemWithBoldValue
                            label="Worker Commands"
                            value={
                                isEmpty(config.BUILD_AND_RUN_COMMANDS) ? (
                                    '—'
                                ) : (
                                    <JobSimpleTagsSection array={config.BUILD_AND_RUN_COMMANDS} label="COMMAND" />
                                )
                            }
                        />
                    )}

                    {!!job.jobTags && job.jobTags.filter((tag) => !tag.startsWith('CT:')).length > 0 && (
                        <ItemWithBoldValue label="Tags" value={<JobSimpleTagsSection array={job.jobTags} />} />
                    )}
                </div>
            </div>
        </BorderedCard>
    );
}
