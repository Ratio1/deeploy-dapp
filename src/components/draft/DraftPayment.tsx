import { getJobsTotalCost } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import SupportFooter from '@shared/SupportFooter';
import { GenericJob, Job, JobType, type Project } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { RiBox3Line, RiDraftLine } from 'react-icons/ri';
import ProjectIdentity from '../../shared/projects/ProjectIdentity';
import GenericJobsCostRundown from './job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from './job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from './job-rundowns/ServiceJobsCostRundown';

export default function DraftPayment({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    useEffect(() => {
        console.log('[DraftPayment] jobs', jobs);
    }, [jobs]);

    const formatGenericJobPayload = (job: GenericJob) => {
        // Convert env vars array to object
        const envVars: Record<string, string> = {};
        job.deployment.envVars.forEach((envVar) => {
            envVars[envVar.key] = envVar.value;
        });

        // Convert dynamic env vars array to object
        const dynamicEnvVars: Record<string, Array<{ type: string; value: string }>> = {};
        job.deployment.dynamicEnvVars.forEach((dynamicEnvVar) => {
            dynamicEnvVars[dynamicEnvVar.key] = dynamicEnvVar.values;
        });

        // Handle container configuration
        let image = 'repo/image:tag';
        let crData = {
            SERVER: 'docker.io',
            USERNAME: 'user',
            PASSWORD: 'password',
        };

        if (job.deployment.container.type === 'image') {
            image = job.deployment.container.containerImage;
            crData = {
                SERVER: job.deployment.container.containerRegistry,
                USERNAME: job.deployment.container.crUsername,
                PASSWORD: job.deployment.container.crPassword,
            };
        }

        // Generate nonce (current timestamp in milliseconds as hex)
        const nonce = Math.floor(Date.now() * 1000).toString(16);

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: 'CONTAINER_APP_RUNNER',
            nonce: nonce,
            target_nodes: job.deployment.targetNodes || [],
            target_nodes_count: job.specifications.targetNodesCount,
            node_res_req: {}, // TODO: This should not be included
            app_params: {
                IMAGE: image,
                CR_DATA: crData,
                CONTAINER_RESOURCES: {}, // TODO: Only the container name should be sent
                PORT: job.deployment.port.toString(),
                NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || 'None',
                NGROK_EDGE_LABEL: 'None',
                NGROK_ENABLED: job.deployment.tunnelingToken ? 'True' : 'False',
                NGROK_USE_API: 'True',
                VOLUMES: {}, // TODO: Implement
                ENV: envVars,
                DYNAMIC_ENV: dynamicEnvVars,
                RESTART_POLICY: job.deployment.restartPolicy,
                IMAGE_PULL_POLICY: job.deployment.imagePullPolicy,
            },
            pipeline_input_type: 'void',
            pipeline_input_uri: 'None',
            chainstore_response: 'True',
        };
    };

    const onPayAndDeploy = () => {
        if (!jobs) {
            return;
        }

        console.log('[DraftPayment] onPayAndDeploy', jobs);

        const payloads = jobs.map((job) => {
            let payload = {};

            switch (job.jobType) {
                case JobType.Generic:
                    payload = formatGenericJobPayload(job as GenericJob);
                    break;

                case JobType.Native:
                    payload = {};
                    break;

                case JobType.Service:
                    payload = {};
                    break;

                default:
                    payload = {};
                    break;
            }

            return payload;
        });

        console.log('[DraftPayment] payloads', payloads);
    };

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <ProjectIdentity project={project} />

                    <div className="row gap-2">
                        <OverviewButton />

                        <ActionButton color="primary" variant="solid" onPress={onPayAndDeploy} isDisabled={jobs?.length === 0}>
                            <div className="row gap-1.5">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Pay & Deploy</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                {/* Total Amount Due */}
                {!!jobs && !!jobs.length && (
                    <BorderedCard isLight={false}>
                        <div className="row justify-between py-2">
                            <div className="text-[15px] font-medium text-slate-500">Total Amount Due</div>

                            <div className="text-primary text-[19px] font-semibold">
                                <span className="text-slate-500">$USDC</span>{' '}
                                {parseFloat(getJobsTotalCost(jobs).toFixed(2)).toLocaleString()}
                            </div>
                        </div>
                    </BorderedCard>
                )}

                {/* Rundowns */}
                {!!jobs && !!jobs.length && (
                    <>
                        {jobs.filter((job) => job.jobType === JobType.Generic).length > 0 && (
                            <GenericJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Generic)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Native).length > 0 && (
                            <NativeJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Native)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Service).length > 0 && (
                            <ServiceJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Service)} />
                        )}
                    </>
                )}

                {/* No Jobs added */}
                {!!jobs && jobs.length === 0 && (
                    <BorderedCard>
                        <div className="center-all">
                            <EmptyData
                                title="No jobs added"
                                description="Add a job first to proceed with payment."
                                icon={<RiDraftLine />}
                            />
                        </div>
                    </BorderedCard>
                )}
            </div>

            <SupportFooter />
        </div>
    );
}
