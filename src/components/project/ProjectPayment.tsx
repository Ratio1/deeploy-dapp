import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getJobsTotalCost } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import SupportFooter from '@shared/SupportFooter';
import { FormType, Job, ProjectPage, type Project } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { RiArrowLeftLine, RiBox3Line, RiDraftLine } from 'react-icons/ri';
import ProjectIdentity from './ProjectIdentity';
import GenericJobsCostRundown from './rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from './rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from './rundowns/ServiceJobsCostRundown';

export default function ProjectPayment({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    const { setProjectPage } = useDeploymentContext() as DeploymentContextType;

    useEffect(() => {
        console.log('[ProjectPayment] jobs', jobs);
    }, [jobs]);

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <ProjectIdentity project={project} />

                    <div className="row gap-2">
                        <ActionButton
                            className="slate-button"
                            color="default"
                            onPress={() => {
                                setProjectPage(ProjectPage.Overview);
                            }}
                        >
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="text-sm font-medium">Project</div>
                            </div>
                        </ActionButton>

                        <ActionButton
                            color="primary"
                            variant="solid"
                            onPress={() => {
                                console.log('Deploy');
                            }}
                            isDisabled={jobs?.length === 0}
                        >
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
                            <div className="text-[15px] font-semibold text-slate-500">Total Amount Due</div>

                            <div className="text-xl font-semibold text-primary">
                                <span className="text-slate-500">$USDC</span> {getJobsTotalCost(jobs)}
                            </div>
                        </div>
                    </BorderedCard>
                )}

                {/* Rundowns */}
                {!!jobs && !!jobs.length && (
                    <>
                        {jobs.filter((job) => job.formType === FormType.Generic).length > 0 && (
                            <GenericJobsCostRundown jobs={jobs.filter((job) => job.formType === FormType.Generic)} />
                        )}
                        {jobs.filter((job) => job.formType === FormType.Native).length > 0 && (
                            <NativeJobsCostRundown jobs={jobs.filter((job) => job.formType === FormType.Native)} />
                        )}
                        {jobs.filter((job) => job.formType === FormType.Service).length > 0 && (
                            <ServiceJobsCostRundown jobs={jobs.filter((job) => job.formType === FormType.Service)} />
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
