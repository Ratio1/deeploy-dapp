import { CspEscrowAbi } from '@blockchain/CspEscrow';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import JobConfiguration from '@components/job/JobConfiguration';
import JobFullUsage from '@components/job/JobFullUsage';
import JobInstances from '@components/job/JobInstances';
import JobResources from '@components/job/JobResources';
import JobStats from '@components/job/JobStats';
import JobPageLoading from '@components/loading/JobPageLoading';
import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { sendJobCommand } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import SupportFooter from '@shared/SupportFooter';
import { RunningJob, RunningJobWithDetails, RunningJobWithResources } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiEdit2Line, RiStopCircleLine } from 'react-icons/ri';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';

export default function Job() {
    const { escrowContractAddress, formatRunningJobsWithDetails } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();
    const { jobId } = useParams();

    const [isLoading, setLoading] = useState(true);
    const [isActionOngoing, setActionOngoing] = useState(false);

    const [job, setJob] = useState<RunningJobWithResources | undefined>();

    useEffect(() => {
        if (publicClient && jobId && escrowContractAddress) {
            fetchJob();
        }
    }, [publicClient, jobId, escrowContractAddress]);

    const fetchJob = async () => {
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
            const runningJobsWithDetails: RunningJobWithDetails[] = formatRunningJobsWithDetails([runningJob]);

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

    if (isLoading || !job) {
        return <JobPageLoading />;
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <JobBreadcrumbs job={job} />

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
                            className="bg-red-500"
                            color="danger"
                            onPress={() => onJobCommand('STOP')}
                            isDisabled={isActionOngoing}
                        >
                            <div className="row gap-1.5">
                                <RiStopCircleLine className="text-lg" />
                                <div className="text-sm">Stop</div>
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

                {/* Stats */}
                <JobStats job={job} />

                {/* Usage */}
                <JobFullUsage job={job} />

                {/* Resources */}
                <JobResources resources={job.resources} />

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
