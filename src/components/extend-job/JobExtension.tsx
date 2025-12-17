'use client';

import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import { formatResourcesSummary } from '@data/containerResources';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { config, environment, getCurrentEpoch, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { addTimeFn, diffTimeFn, formatUsdc, getResourcesCostPerEpoch } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import CostAndDurationInterface from '@shared/jobs/CostAndDurationInterface';
import PayButtonWithAllowance from '@shared/jobs/PayButtonWithAllowance';
import { SmallTag } from '@shared/SmallTag';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { addDays, differenceInHours, max } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

export default function JobExtension({ job }: { job: RunningJobWithResources }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { escrowContractAddress } = useDeploymentContext() as DeploymentContextType;

    const router = useRouter();

    const costPerEpoch: bigint = useMemo(() => {
        return (
            job.numberOfNodesRequested * getResourcesCostPerEpoch(job.resources.containerOrWorkerType, job.resources.gpuType)
        );
    }, [job]);

    const [duration, setDuration] = useState<number>(12); // In months
    const [totalCost, setTotalCost] = useState<bigint>(0n);
    const [isLoading, setLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number, messagesToSign: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const onSubmit = async () => {
        if (!walletClient || !publicClient || !address || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        setLoading(true);

        try {
            deeployFlowModalRef.current?.open(1, 0);

            const status = await extendJob();

            if (status === 'reverted') {
                throw new Error('Transaction failed.');
            } else {
                toast.success('Job duration extended successfully.');
                deeployFlowModalRef.current?.progress('done');

                setTimeout(() => {
                    deeployFlowModalRef.current?.close();
                    router.push(`${routePath.deeploys}/${routePath.job}/${Number(job!.id)}`);
                }, 1000);
            }
        } catch (err: any) {
            console.error(err.message);
            toast.error('Failed to extend job, please try again.');
            deeployFlowModalRef.current?.displayError();
        } finally {
            setLoading(false);
        }
    };

    const extendJob = async (): Promise<'success' | 'reverted'> => {
        const expiryDate = addDays(new Date(), duration * 30);
        const durationInEpochs = diffTimeFn(expiryDate, new Date());

        const lastExecutionEpoch: bigint = BigInt(
            Math.max(getCurrentEpoch(), Number(job.lastExecutionEpoch)) + durationInEpochs,
        );

        console.log('[JobExtension]', {
            lastExecutionEpoch,
            durationInEpochs,
            expiryDate,
            diffInHours: differenceInHours(expiryDate, new Date(), {
                roundingMethod: 'ceil',
            }),
        });

        const txHash = await walletClient!.writeContract({
            address: escrowContractAddress!,
            abi: CspEscrowAbi,
            functionName: 'extendJobDuration',
            args: [job.id, lastExecutionEpoch],
        });

        const receipt = await watchTx(txHash, publicClient);
        return receipt.status;
    };

    const summaryItems: { label: string; value: string | number; tag?: React.ReactNode }[] = useMemo(
        () => [
            {
                label: 'Compute Type',
                value: `CPU ${job.resources.gpuType ? ' & GPU' : ''}`,
            },
            {
                label: `${job.resources.jobType === JobType.Native ? 'Worker' : 'Container'} Type`,
                value: job.resources.containerOrWorkerType.name,
            },
            {
                label: 'Resources',
                value: formatResourcesSummary(job.resources.containerOrWorkerType),
            },
            {
                label: 'Target Nodes',
                value: Number(job.numberOfNodesRequested),
            },
            {
                label: 'Monthly Cost',
                value: `~$${formatUsdc(costPerEpoch * 30n * (environment === 'devnet' ? 24n : 1n), 1)}`,
            },
            {
                label: 'End Date',
                value: addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch)).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
                tag: <SmallTag>Previous</SmallTag>,
            },
            {
                label: 'End Date',
                value: addTimeFn(
                    max([new Date(), addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch))]),
                    duration * 30 * (environment === 'devnet' ? 24 : 1),
                ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
                tag: <SmallTag variant="blue">New</SmallTag>,
            },
        ],
        [costPerEpoch, duration, job],
    );

    const handleDurationChange = useCallback(
        (value: number) => {
            setDuration((previousDuration: number) => {
                if (previousDuration === value) {
                    return previousDuration;
                }

                return value;
            });
        },
        [setDuration],
    );

    const handleTotalCostChange = useCallback(
        (value: bigint) => {
            setTotalCost((previousTotalCost) => {
                if (previousTotalCost === value) {
                    return previousTotalCost;
                }

                return value;
            });
        },
        [setTotalCost],
    );

    return (
        <>
            <div className="col gap-6">
                <CostAndDurationInterface
                    costPerEpoch={costPerEpoch}
                    summaryItems={summaryItems}
                    initialDuration={12}
                    initialPaymentMonthsCount={12}
                    onDurationChange={handleDurationChange}
                    onTotalCostChange={handleTotalCostChange}
                    isDisabled={isLoading}
                />

                <div className="center-all">
                    <PayButtonWithAllowance
                        totalCost={totalCost}
                        isLoading={isLoading}
                        setLoading={setLoading}
                        callback={onSubmit}
                        isButtonDisabled={totalCost === 0n}
                    />
                </div>
            </div>

            <DeeployFlowModal ref={deeployFlowModalRef} actions={['payment']} type="extend" />
        </>
    );
}
