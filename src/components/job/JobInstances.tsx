import { sendInstanceCommand } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { getShortAddressOrHash } from '@lib/utils';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import { R1Address } from '@typedefs/blockchain';
import { Plugin } from '@typedefs/deeployApi';
import clsx from 'clsx';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiTimeLine } from 'react-icons/ri';
import { useAccount, useSignMessage } from 'wagmi';

export default function JobInstances({
    instances,
    lastNodesChangeTimestamp,
    jobAlias,
    jobId,
    fetchJob,
}: {
    instances: {
        nodeAddress: R1Address;
        plugins: (Plugin & { signature: string })[];
    }[];
    lastNodesChangeTimestamp: bigint;
    jobAlias: string;
    jobId: bigint;
    fetchJob: () => void;
}) {
    const [isActionOngoing, setActionOngoing] = useState(false);

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();

    const onInstanceCommand = async (command: 'RESTART' | 'STOP', pluginSignature: string, instanceId: string) => {
        setActionOngoing(true);

        try {
            await buildAndSendInstanceRequest(command, pluginSignature, instanceId);
            fetchJob();
        } catch (error) {
            console.error(error);
        } finally {
            setActionOngoing(false);
        }
    };

    const buildAndSendInstanceRequest = async (command: 'RESTART' | 'STOP', pluginSignature: string, instanceId: string) => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        const nonce = generateDeeployNonce();

        const payload = {
            app_id: jobAlias,
            job_id: Number(jobId),
            nonce,
            plugin_signature: pluginSignature,
            instance_id: instanceId,
            instance_command: command,
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

        const promise = sendInstanceCommand(request).then((response) => {
            console.log(response);

            if (!response || response.status === 'fail') {
                throw new Error('Action failed.');
            }
        });

        toast.promise(promise, {
            loading: `${command === 'RESTART' ? 'Restarting' : 'Stopping'} instance...    `,
            success: <div>Instance was {command === 'RESTART' ? 'restarted' : 'stopped'} successfully.</div>,
            error: <div>Could not {command.toLowerCase()} instance.</div>,
        });

        const response = await promise;
        return response;
    };

    return (
        <CompactCustomCard
            header={
                <div className="row gap-2">
                    <div className="compact">Instances</div>

                    <div className="center-all bg-light h-5 w-5 rounded-full">
                        <div className="text-xs font-medium text-slate-600">{instances.length}</div>
                    </div>
                </div>
            }
            footer={
                <div className="row compact justify-between text-slate-600">
                    <div className="row gap-1">
                        <RiTimeLine className="text-lg" />
                        <div>Last Change Timestamp</div>
                    </div>

                    <div>
                        {!lastNodesChangeTimestamp ? 'N/A' : new Date(Number(lastNodesChangeTimestamp) * 1000).toLocaleString()}
                    </div>
                </div>
            }
        >
            <div className="col gap-3 px-4 py-3">
                {instances.map((instance) => {
                    return (
                        <div key={instance.nodeAddress} className="flex items-start gap-2">
                            <div className="center-all h-6">
                                <div
                                    className={clsx('h-2.5 w-2.5 rounded-full', {
                                        'bg-emerald-500': true,
                                        'bg-red-500': false,
                                    })}
                                ></div>
                            </div>

                            <div className="col gap-2">
                                <div className="row gap-2">
                                    <SmallTag isLarge>
                                        <CopyableValue value={instance.nodeAddress}>
                                            {getShortAddressOrHash(instance.nodeAddress, 8)}
                                        </CopyableValue>
                                    </SmallTag>
                                </div>

                                <div className="col bg-slate-75 rounded-lg p-2 pr-4">
                                    {instance.plugins.map((plugin, index, array) => {
                                        return (
                                            <div key={plugin.signature} className="row gap-1.5">
                                                {/* Tree Line */}
                                                <div className="row relative mr-2 ml-2.5">
                                                    <div className="h-10 w-0.5 bg-slate-300"></div>
                                                    <div className="h-0.5 w-5 bg-slate-300"></div>

                                                    {index === array.length - 1 && (
                                                        <div className="bg-slate-75 absolute bottom-0 left-0 h-[19px] w-0.5"></div>
                                                    )}
                                                </div>

                                                <SmallTag variant="blue" isLarge>
                                                    {plugin.instance}
                                                </SmallTag>

                                                <ContextMenuWithTrigger
                                                    items={[
                                                        {
                                                            key: 'restart',
                                                            label: 'Restart',
                                                            onPress: () => {
                                                                onInstanceCommand('RESTART', plugin.signature, plugin.instance);
                                                            },
                                                        },
                                                        {
                                                            key: 'stop',
                                                            label: 'Stop',
                                                            onPress: () => {
                                                                onInstanceCommand('STOP', plugin.signature, plugin.instance);
                                                            },
                                                        },
                                                    ]}
                                                    isDisabled={isActionOngoing}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </CompactCustomCard>
    );
}
