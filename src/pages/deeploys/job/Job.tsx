import { CspEscrowAbi } from '@blockchain/CspEscrow';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import JobConfiguration from '@components/job/JobConfiguration';
import JobFullUsage from '@components/job/JobFullUsage';
import JobInstances from '@components/job/JobInstances';
import JobSpecifications from '@components/job/JobSpecifications';
import JobStats from '@components/job/JobStats';
import JobPageLoading from '@components/loading/JobPageLoading';
import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { deletePipeline, sendJobCommand } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import RefreshRequiredAlert from '@shared/jobs/RefreshRequiredAlert';
import SupportFooter from '@shared/SupportFooter';
import { Apps } from '@typedefs/deeployApi';
import { RunningJob, RunningJobWithDetails, RunningJobWithResources } from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiCloseFill, RiDeleteBinLine, RiEdit2Line, RiStopCircleLine } from 'react-icons/ri';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';

export default function Job() {
    const { escrowContractAddress, formatRunningJobsWithDetails, fetchApps, setFetchAppsRequired } =
        useDeploymentContext() as DeploymentContextType;
    const { confirm } = useInteractionContext() as InteractionContextType;

    const navigate = useNavigate();
    const location = useLocation();

    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();
    const { jobId } = useParams();

    const [isLoading, setLoading] = useState(true);
    const [isActionOngoing, setActionOngoing] = useState(false);

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

    const onEdit = () => {
        navigate(routePath.edit, { state: { job } });
    };

    const onJobCommand = async (command: 'RESTART' | 'STOP') => {
        setActionOngoing(true);

        try {
            await buildAndSendAppRequest(command);
            fetchJob();
        } catch (error) {
            console.error(error);
        } finally {
            setActionOngoing(false);
        }
    };

    const buildAndSendAppRequest = async (command: 'RESTART' | 'STOP') => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        const nonce = generateNonce();

        const payload = {
            app_id: job!.alias,
            job_id: Number(job!.id),
            command,
            nonce,
        };

        const message = buildDeeployMessage(payload, 'Please sign this message for Deeploy: ');

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            ...payload,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        const promise = sendJobCommand(request).then((response) => {
            console.log(response);

            if (!response || response.status === 'fail') {
                throw new Error('Action failed.');
            }
        });

        toast.promise(promise, {
            loading: `${command === 'RESTART' ? 'Restarting' : 'Stopping'} job...    `,
            success: <div>Job was {command === 'RESTART' ? 'restarted' : 'stopped'} successfully.</div>,
            error: <div>Could not {command.toLowerCase()} job.</div>,
        });

        const response = await promise;
        return response;
    };

    const onDeleteJob = async () => {
        if (!job) {
            return;
        }

        const confirmed = await confirm(
            <div className="col gap-3">
                Are you sure you want to delete the following job?
                <div className="font-medium">{job.alias}</div>
                <div>This will stop and permanently remove the job from all running nodes.</div>
                <div>
                    You'll need to sign <span className="text-primary font-medium">one message</span> in order to delete your
                    job.
                </div>
            </div>,
        );

        if (!confirmed) {
            return;
        }

        setActionOngoing(true);

        try {
            await buildAndSendDeleteRequest();
            setFetchAppsRequired(true);
            navigate(`${routePath.deeploys}/${routePath.project}/${job.projectHash}`);
        } catch (error) {
            console.error(error);
        } finally {
            setActionOngoing(false);
        }
    };

    const buildAndSendDeleteRequest = async () => {
        if (!address) {
            toast.error('Please connect your wallet.');
            throw new Error('Wallet not connected');
        }

        if (!job) {
            throw new Error('Job data unavailable');
        }

        const nonce = generateNonce();

        const payload = {
            app_id: job.alias,
            job_id: Number(job.id),
            project_id: job.projectHash,
            nonce,
        };

        const message = buildDeeployMessage(payload, 'Please sign this message for Deeploy: ');

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            ...payload,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        const promise = deletePipeline(request).then((response) => {
            console.log(response);

            if (!response || response.status === 'fail') {
                throw new Error(response?.error || 'Action failed.');
            }

            return response;
        });

        toast.promise(promise, {
            loading: 'Deleting job…',
            success: <div>Job deleted successfully.</div>,
            error: <div>Could not delete job.</div>,
        });

        await promise;
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
                            isDisabled={isActionOngoing}
                        >
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Project</div>
                            </div>
                        </ActionButton>

                        <ActionButton
                            className="slate-button"
                            color="default"
                            onPress={() => onJobCommand('RESTART')}
                            isDisabled={isActionOngoing}
                        >
                            <div className="text-sm">Restart</div>
                        </ActionButton>

                        <ActionButton
                            className="slate-button"
                            color="default"
                            onPress={() => onJobCommand('STOP')}
                            isDisabled={isActionOngoing}
                        >
                            <div className="row gap-1.5">
                                <RiStopCircleLine className="text-lg" />
                                <div className="text-sm">Stop</div>
                            </div>
                        </ActionButton>

                        <ActionButton
                            className="bg-red-600"
                            color="danger"
                            variant="solid"
                            onPress={onDeleteJob}
                            isDisabled={isActionOngoing}
                        >
                            <div className="row gap-1.5">
                                <RiDeleteBinLine className="text-lg" />
                                <div className="text-sm">Delete</div>
                            </div>
                        </ActionButton>

                        <ActionButton color="primary" variant="solid" onPress={onEdit} isDisabled={isActionOngoing}>
                            <div className="row gap-1.5">
                                <RiEdit2Line className="text-lg" />
                                <div className="compact">Edit</div>
                            </div>
                        </ActionButton>
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
                            <div className="font-medium">Your job was updated successfully by the following server: </div>
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
