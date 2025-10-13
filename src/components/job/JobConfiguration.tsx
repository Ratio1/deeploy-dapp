import { Skeleton } from '@heroui/skeleton';
import { GITHUB_REPO_REGEX } from '@lib/deeploy-utils';
import { extractRepositoryPath, getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { SmallTag } from '@shared/SmallTag';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import JobDynamicEnvSection from './JobDynamicEnvSection';
import JobFileVolumesSection from './JobFileVolumesSection';
import JobKeyValueSection from './JobKeyValueSection';
import JobSimpleTagsSection from './JobSimpleTagsSection';

export default function JobConfiguration({ job }: { job: RunningJobWithResources }) {
    const config: JobConfig = job.config;
    const tags = !job.jobTags ? [] : job.jobTags.filter((tag) => tag !== '');

    const [repositoryVisibility, setRepositoryVisibility] = useState<'public' | 'private' | '—' | undefined>();

    const hasLoggedInitialState = useRef(false);

    if (!hasLoggedInitialState.current) {
        console.log('JobConfiguration', { job, config });
        hasLoggedInitialState.current = true;
    }

    useEffect(() => {
        if (config && config.VCS_DATA) {
            fetchRepositoryVisibility(config.VCS_DATA.REPO_URL);
        }
    }, [config]);

    const fetchRepositoryVisibility = async (url: string) => {
        const match = url.match(GITHUB_REPO_REGEX);

        if (!match) {
            console.error('Not a valid GitHub repository URL');
            setRepositoryVisibility('—');
            return;
        }

        const [, owner, rawRepo] = match;
        const repo = rawRepo.replace(/\.git$/i, '');

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

            if (!response.ok) {
                throw new Error(`GitHub repository lookup failed with status ${response.status}`);
            }

            setRepositoryVisibility('public');
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                return;
            }

            console.error('Repository visibility is: private');
            setRepositoryVisibility('private');
        }
    };

    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="text-lg font-semibold">Configuration</div>

                <div className="col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        {!!config.PORT && <ItemWithBoldValue label="Port" value={config.PORT} />}

                        <ItemWithBoldValue
                            label="Tunnel Engine Enabled"
                            value={(!!config.TUNNEL_ENGINE_ENABLED).toString()}
                            capitalize
                        />

                        {!!config.TUNNEL_ENGINE_ENABLED && (
                            <>
                                <ItemWithBoldValue label="Tunnel Engine" value={config.TUNNEL_ENGINE} capitalize />
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
                    <Section title="Nodes" />
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

                    {/* Worker App Runner */}
                    {!!config.VCS_DATA && (
                        <>
                            <Section title="Worker App Runner" />

                            <div className="grid grid-cols-2 gap-3">
                                <ItemWithBoldValue
                                    label="GitHub Repository"
                                    value={
                                        <CopyableValue value={config.VCS_DATA.REPO_URL}>
                                            {extractRepositoryPath(config.VCS_DATA.REPO_URL)}
                                        </CopyableValue>
                                    }
                                />

                                <ItemWithBoldValue
                                    label="Repository Visibility"
                                    value={repositoryVisibility ?? <Skeleton className="my-0.5 min-h-5 w-20 rounded-md" />}
                                    capitalize
                                />

                                <ItemWithBoldValue label="GitHub Username" value={config.VCS_DATA.USERNAME || '—'} />

                                <ItemWithBoldValue
                                    label="Personal Access Token"
                                    value={
                                        config.VCS_DATA.TOKEN ? (
                                            <CopyableValue value={config.VCS_DATA.TOKEN}>
                                                {getShortAddressOrHash(config.VCS_DATA.TOKEN, 4, false)}
                                            </CopyableValue>
                                        ) : (
                                            '—'
                                        )
                                    }
                                />

                                {!!config.BUILD_AND_RUN_COMMANDS && (
                                    <ItemWithBoldValue
                                        label="Worker Commands"
                                        value={
                                            isEmpty(config.BUILD_AND_RUN_COMMANDS) ? (
                                                '—'
                                            ) : (
                                                <JobSimpleTagsSection
                                                    array={config.BUILD_AND_RUN_COMMANDS}
                                                    type="col"
                                                    label="COMMAND"
                                                />
                                            )
                                        }
                                    />
                                )}

                                <ItemWithBoldValue label="Image" value={config.IMAGE} />
                            </div>
                        </>
                    )}

                    {/* Container App Runner */}
                    {!!config.CR_DATA && (
                        <>
                            <Section title="Container App Runner" />

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
                            <Section title="Service" />
                            <ItemWithBoldValue label="Image" value={config.IMAGE} />
                        </>
                    )}

                    {/* Variables */}
                    <Section title="Variables" />

                    <div className="col gap-3">
                        <div className="col gap-3">
                            <ItemWithBoldValue
                                label="ENV Variables"
                                value={isEmpty(config.ENV) ? '—' : <JobKeyValueSection obj={config.ENV} />}
                            />

                            <ItemWithBoldValue
                                label="Dynamic ENV Variables"
                                value={
                                    isEmpty(config.DYNAMIC_ENV) ? '—' : <JobDynamicEnvSection dynamicEnv={config.DYNAMIC_ENV} />
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <ItemWithBoldValue
                                label="Volumes"
                                value={isEmpty(config.VOLUMES) ? '—' : <JobKeyValueSection obj={config.VOLUMES} />}
                            />

                            <ItemWithBoldValue
                                label="File Volumes"
                                value={isEmpty(config.FILE_VOLUMES) ? '—' : <JobFileVolumesSection obj={config.FILE_VOLUMES} />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </BorderedCard>
    );
}

const Section = ({ title }: { title: string }) => (
    <div className="row mt-1 w-full gap-3">
        <SmallTag variant="accent">
            <div className="whitespace-nowrap">{title}</div>
        </SmallTag>
        <div className="w-full border-b-2 border-slate-200"></div>
    </div>
);
