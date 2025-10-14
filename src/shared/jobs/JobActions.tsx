import { Button } from '@heroui/button';
import { deletePipeline, sendJobCommand } from '@lib/api/deeploy';
import { getCurrentEpoch, getDevAddress, isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAccount, useSignMessage } from 'wagmi';

export default function JobActions({
    job,
    type,
    onJobDeleted,
}: {
    job: RunningJobWithResources;
    type: 'compact' | 'button';
    onJobDeleted?: () => void;
}) {
    const { setFetchAppsRequired } = useDeploymentContext() as DeploymentContextType;
    const { confirm } = useInteractionContext() as InteractionContextType;

    const navigate = useNavigate();

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();

    const [isContextMenuOpen, setContextMenuOpen] = useState(false);
    const [isActionOngoing, setActionOngoing] = useState(false);

    const onEdit = () => {
        navigate(`${routePath.deeploys}/${routePath.job}/${job.id}/${routePath.edit}`, { state: { job } });
    };

    const onExtendJob = () => {
        navigate(`${routePath.deeploys}/${routePath.job}/${job.id}/${routePath.extend}`, { state: { job } });
    };

    const onJobCommand = async (command: 'RESTART' | 'STOP') => {
        setActionOngoing(true);

        try {
            await buildAndSendJobCommandRequest(command);
            setFetchAppsRequired(true);
        } catch (error) {
            console.error(error);
        } finally {
            setActionOngoing(false);
        }
    };

    const buildAndSendJobCommandRequest = async (command: 'RESTART' | 'STOP') => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        const nonce = generateDeeployNonce();

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
            onJobDeleted?.();
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

        const nonce = generateDeeployNonce();

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

    return (
        <ContextMenuWithTrigger
            items={[
                {
                    key: 'restart',
                    label: 'Restart',
                    description: 'Restart all the job instances',
                    isDisabled: getCurrentEpoch() >= Number(job.lastExecutionEpoch),
                    onPress: () => onJobCommand('RESTART'),
                },
                {
                    key: 'stop',
                    label: 'Stop',
                    description: 'Stop all the job instances',
                    isDisabled: getCurrentEpoch() >= Number(job.lastExecutionEpoch),
                    onPress: () => onJobCommand('STOP'),
                },
                {
                    key: 'extend',
                    label: 'Extend',
                    description: 'Increas the duration of the job',
                    isDisabled: getCurrentEpoch() >= Number(job.lastExecutionEpoch),
                    onPress: onExtendJob,
                },
                {
                    key: 'edit',
                    label: 'Edit',
                    description: 'Modify the configuration of the job',
                    isDisabled: getCurrentEpoch() >= Number(job.lastExecutionEpoch),
                    onPress: onEdit,
                },
                {
                    key: 'delete',
                    label: 'Delete',
                    description: 'Remove the job from all running nodes',
                    onPress: onDeleteJob,
                },
            ]}
            onOpenChange={(isOpen) => {
                setContextMenuOpen(isOpen);
            }}
        >
            {type === 'button' && (
                <Button color="primary" isDisabled={isActionOngoing} disableRipple>
                    <div className="row -mr-1 gap-1">
                        <div className="compact">Actions</div>
                        <RiArrowDownSLine
                            className={`mt-0.5 text-xl transition-transform duration-200${isContextMenuOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </Button>
            )}
        </ContextMenuWithTrigger>
    );
}
