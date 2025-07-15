import { routePath } from '@lib/routes/route-paths';
import { BorderedCard } from '@shared/cards/BorderedCard';
import DeeployButton from '@shared/deeploy-app/DeeployButton';
import EmptyData from '@shared/EmptyData';
import SupportFooter from '@shared/SupportFooter';
import { Job, type Project } from '@typedefs/deployment';
import { useEffect } from 'react';
import { RiArrowLeftLine, RiBox3Line, RiDraftLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import ProjectIdentity from './ProjectIdentity';

export default function ProjectPayment({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
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
                        <DeeployButton
                            className="slate-button"
                            color="default"
                            as={Link}
                            to={`${routePath.deeploys}/${routePath.project}/${project.id}`}
                        >
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="text-sm font-medium">Project</div>
                            </div>
                        </DeeployButton>

                        <DeeployButton
                            color="primary"
                            variant="solid"
                            onPress={() => {
                                console.log('Deeploy');
                            }}
                            isDisabled={jobs?.length === 0}
                        >
                            <div className="row gap-1.5">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Pay & Deeploy</div>
                            </div>
                        </DeeployButton>
                    </div>
                </div>

                {/* No Jobs added */}
                {jobs !== undefined && jobs.length === 0 && (
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
