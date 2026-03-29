'use client';

import { Button } from '@heroui/button';
import { deletePipeline, sendJobCommand } from '@lib/api/deeploy';
import { getCurrentEpoch, getDevAddress, isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';

export default function StackActions({
    jobs,
    onCompleted,
}: {
    jobs: RunningJobWithResources[];
    onCompleted?: (action: 'restart' | 'stop' | 'delete') => void;
}) {
    const { setFetchAppsRequired } = useDeploymentContext() as DeploymentContextType;
    const { confirm } = useInteractionContext() as InteractionContextType;
    const router = useRouter();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();

    const [isOpen, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const hasExpiredJobs = useMemo(() => jobs.some((job) => getCurrentEpoch() >= Number(job.lastExecutionEpoch)), [jobs]);
    const stackId = jobs[0]?.stack?.stackId;

    const signRequest = async (payload: Record<string, unknown>) => {
        if (!address) {
            throw new Error('Please connect your wallet.');
        }

        const message = buildDeeployMessage(payload, 'Please sign this message for Deeploy: ');
        const signature = await signMessageAsync({
            account: address,
            message,
        });

        return {
            ...payload,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };
    };

    const executeCommand = async (command: 'RESTART' | 'STOP') => {
        if (!jobs.length) {
            return;
        }

        setLoading(true);

        try {
            const results = await Promise.allSettled(
                jobs.map(async (job) => {
                    const request = await signRequest({
                        app_id: job.alias,
                        job_id: Number(job.id),
                        command,
                        nonce: generateDeeployNonce(),
                    });

                    return sendJobCommand(request as any);
                }),
            );

            const failed = results.filter(
                (result) => result.status === 'rejected' || (result.status === 'fulfilled' && result.value.status !== 'success' && result.value.status !== 'command_delivered'),
            );

            if (!failed.length) {
                toast.success(`Stack ${command === 'RESTART' ? 'restarted' : 'stopped'} successfully.`);
            } else {
                toast.error(`${failed.length}/${jobs.length} stack container actions failed.`);
            }

            setFetchAppsRequired(true);
            onCompleted?.(command === 'RESTART' ? 'restart' : 'stop');
        } finally {
            setLoading(false);
        }
    };

    const executeDelete = async () => {
        if (!jobs.length) {
            return;
        }

        const confirmed = await confirm(
            <div className="col gap-3">
                <div>Delete all jobs in this stack?</div>
                <div>This will stop and permanently remove all stack members from running nodes.</div>
                <div>You will be prompted to sign one message for each stack member.</div>
            </div>,
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);

        try {
            const results = await Promise.allSettled(
                jobs.map(async (job) => {
                    const request = await signRequest({
                        app_id: job.alias,
                        job_id: Number(job.id),
                        project_id: job.projectHash,
                        nonce: generateDeeployNonce(),
                    });

                    return deletePipeline(request as any);
                }),
            );

            const failed = results.filter(
                (result) => result.status === 'rejected' || (result.status === 'fulfilled' && result.value.status !== 'success' && result.value.status !== 'command_delivered'),
            );

            if (!failed.length) {
                toast.success('Stack deleted successfully.');
            } else {
                toast.error(`${failed.length}/${jobs.length} stack delete actions failed.`);
            }

            setFetchAppsRequired(true);
            onCompleted?.('delete');
        } finally {
            setLoading(false);
        }
    };

    const onExtendStack = () => {
        if (!stackId) {
            toast.error('Stack id is missing.');
            return;
        }

        router.push(`${routePath.deeploys}/${routePath.stack}/${stackId}/${routePath.extend}`);
    };

    return (
        <ContextMenuWithTrigger
            items={[
                {
                    key: 'restart',
                    label: 'Restart Stack',
                    description: 'Restart all stack members',
                    isDisabled: hasExpiredJobs,
                    onPress: () => executeCommand('RESTART'),
                },
                {
                    key: 'stop',
                    label: 'Stop Stack',
                    description: 'Stop all stack members',
                    isDisabled: hasExpiredJobs,
                    onPress: () => executeCommand('STOP'),
                },
                {
                    key: 'extend',
                    label: 'Extend Stack',
                    description: 'Increase duration for all stack members',
                    isDisabled: hasExpiredJobs,
                    onPress: onExtendStack,
                },
                {
                    key: 'delete',
                    label: 'Delete Stack',
                    description: 'Delete all stack members',
                    isDangerous: true,
                    onPress: executeDelete,
                },
            ]}
            onOpenChange={setOpen}
        >
            <Button color="primary" isDisabled={isLoading} disableRipple>
                <div className="row -mr-1 gap-1">
                    <div className="compact">Stack Actions</div>
                    <RiArrowDownSLine className={`mt-0.5 text-xl transition-transform duration-200${isOpen ? ' rotate-180' : ''}`} />
                </div>
            </Button>
        </ContextMenuWithTrigger>
    );
}
