import { CspEscrowAbi } from '@blockchain/CspEscrow';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import JobConfiguration from '@components/job/JobConfiguration';
import JobFullUsage from '@components/job/JobFullUsage';
import JobInstances from '@components/job/JobInstances';
import JobSpecifications from '@components/job/JobSpecifications';
import JobStats from '@components/job/JobStats';
import JobPageLoading from '@components/loading/JobPageLoading';
import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import JobActions from '@shared/jobs/JobActions';
import RefreshRequiredAlert from '@shared/jobs/RefreshRequiredAlert';
import SupportFooter from '@shared/SupportFooter';
import { Apps } from '@typedefs/deeployApi';
import { RunningJob, RunningJobWithDetails, RunningJobWithResources } from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiCloseFill } from 'react-icons/ri';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

export default function Job() {
    const { escrowContractAddress, formatRunningJobsWithDetails, fetchApps } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const location = useLocation();

    const publicClient = usePublicClient();
    const { jobId } = useParams();

    const [isLoading, setLoading] = useState(true);

    const [job, setJob] = useState<RunningJobWithResources | undefined>();
    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    // The alias of the server which responsed with a successful job update
    const serverAlias: string | undefined = (location.state as { serverAlias?: string })?.serverAlias;

    const [updatingServerAlias, setUpdatingServerAlias] = useState<string | undefined>();

    useEffect(() => {
        if (serverAlias) {
            setUpdatingServerAlias(serverAlias);
        }
    }, [serverAlias]);

    useEffect(() => {
        if (publicClient && jobId && escrowContractAddress) {
            fetchJob();
        }
    }, [publicClient, jobId, escrowContractAddress]);

    useEffect(() => {
        if (job) {
            setJobTypeOption(jobTypeOptions.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    const fetchJob = async (appsOverride?: Apps) => {
        if (!publicClient || !jobId || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        setLoading(true);

        try {
            const runningJob: RunningJob = await publicClient.readContract({
                address: escrowContractAddress,
                abi: CspEscrowAbi,
                functionName: 'getJobDetails',
                args: [BigInt(jobId)],
            });

            if (!runningJob.id) {
                throw new Error('Job missing from the smart contract.');
            }

            const resources: RunningJobResources | undefined = getRunningJobResources(runningJob.jobType);
            const runningJobsWithDetails: RunningJobWithDetails[] = formatRunningJobsWithDetails([runningJob], appsOverride);

            if (!resources || runningJobsWithDetails.length !== 1) {
                throw new Error('Invalid job, unable to fetch resources.');
            }

            const runningJobWithResources: RunningJobWithResources = {
                ...runningJobsWithDetails[0],
                resources,
            };

            console.log({ runningJobWithResources });
            setJob(runningJobWithResources);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch running job details.');
            navigate(routePath.notFound);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || !job) {
        return <JobPageLoading />;
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <JobBreadcrumbs job={job} jobTypeOption={jobTypeOption} />

                    <div className="row gap-2">
                        <ActionButton
                            className="slate-button"
                            color="default"
                            as={Link}
                            to={`${routePath.deeploys}/${routePath.project}/${job.projectHash}`}
                        >
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Project</div>
                            </div>
                        </ActionButton>

                        <JobActions
                            job={job}
                            type="button"
                            onJobDeleted={() => {
                                navigate(`${routePath.deeploys}/${routePath.project}/${job.projectHash}`);
                            }}
                        />
                    </div>
                </div>

                {!!updatingServerAlias && (
                    <div className="relative rounded-lg border-2 border-green-100 bg-green-100 px-4 py-3 text-sm text-green-800">
                        <div
                            className="absolute top-1.5 right-1 cursor-pointer rounded-full p-1 hover:bg-black/5"
                            onClick={() => setUpdatingServerAlias(undefined)}
                        >
                            <RiCloseFill className="text-lg" />
                        </div>

                        <div className="col gap-0.5">
                            <div className="font-medium">Your job was successfully updated by the following server: </div>
                            <div className="font-medium text-green-600">{updatingServerAlias}</div>
                        </div>
                    </div>
                )}

                <RefreshRequiredAlert
                    customCallback={async () => {
                        setUpdatingServerAlias(undefined);
                        const updatedApps = await fetchApps();
                        await fetchJob(updatedApps);
                    }}
                    isCompact
                />

                {/* Stats */}
                <JobStats job={job} jobTypeOption={jobTypeOption} />

                {/* Usage */}
                <JobFullUsage job={job} />

                {/* Resources */}
                <JobSpecifications resources={job.resources} />

                {/* Configuration */}
                <JobConfiguration job={job} />

                {/* Instances */}
                <JobInstances
                    instances={job.instances}
                    lastNodesChangeTimestamp={job.lastNodesChangeTimestamp}
                    jobAlias={job.alias}
                    jobId={job.id}
                    fetchJob={fetchJob}
                />
            </div>

            <SupportFooter />
        </div>
    );
}
