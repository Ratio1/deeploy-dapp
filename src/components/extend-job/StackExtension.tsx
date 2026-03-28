'use client';

import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { config, environment, getCurrentEpoch, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { addTimeFn, diffTimeFn, formatUsdc } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import CostAndDurationInterface from '@shared/jobs/CostAndDurationInterface';
import PayButtonWithAllowance from '@shared/jobs/PayButtonWithAllowance';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

export default function StackExtension({ jobs, stackId }: { jobs: RunningJobWithResources[]; stackId: string }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { escrowContractAddress } = useDeploymentContext() as DeploymentContextType;

    const router = useRouter();

    const costPerEpoch = useMemo(
        () => jobs.reduce((sum, job) => sum + job.pricePerEpoch * job.numberOfNodesRequested, 0n),
        [jobs],
    );

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

            const status = await extendStackJobs();

            if (status === 'reverted') {
                throw new Error('Transaction failed.');
            }

            toast.success('Stack duration extended successfully.');
            deeployFlowModalRef.current?.progress('done');

            setTimeout(() => {
                deeployFlowModalRef.current?.close();
                router.push(`${routePath.deeploys}/${routePath.stack}/${stackId}`);
            }, 1000);
        } catch (err: any) {
            console.error(err.message);
            toast.error('Failed to extend stack, please try again.');
            deeployFlowModalRef.current?.displayError();
        } finally {
            setLoading(false);
        }
    };

    const extendStackJobs = async (): Promise<'success' | 'reverted'> => {
        const expiryDate = addDays(new Date(), duration * 30);
        const durationInEpochs = diffTimeFn(expiryDate, new Date());
        const currentEpoch = getCurrentEpoch();

        const jobIds = jobs.map((job) => job.id);
        const newLastExecutionEpochs = jobs.map((job) =>
            BigInt(Math.max(currentEpoch, Number(job.lastExecutionEpoch)) + durationInEpochs),
        );

        const txHash = await walletClient!.writeContract({
            address: escrowContractAddress!,
            abi: CspEscrowAbi,
            functionName: 'extendJobsDurationBatch',
            args: [jobIds, newLastExecutionEpochs],
        });

        const receipt = await watchTx(txHash, publicClient);
        return receipt.status;
    };

    const summaryItems: { label: string; value: string | number; tag?: React.ReactNode }[] = useMemo(() => {
        const gpuContainersCount = jobs.filter((job) => !!job.resources.gpuType).length;
        const uniqueContainerTypesCount = new Set(jobs.map((job) => job.resources.containerOrWorkerType.name)).size;
        const maxPreviousEpoch = Math.max(...jobs.map((job) => Number(job.lastExecutionEpoch)));
        const currentEpoch = getCurrentEpoch();
        const maxNewEpoch = Math.max(
            ...jobs.map((job) => Math.max(currentEpoch, Number(job.lastExecutionEpoch)) + duration * 30 * (environment === 'devnet' ? 24 : 1)),
        );

        return [
            {
                label: 'Compute Mix',
                value: gpuContainersCount > 0 ? `${jobs.length - gpuContainersCount} CPU + ${gpuContainersCount} GPU` : 'CPU only',
            },
            {
                label: 'Container Count',
                value: jobs.length,
            },
            {
                label: 'Target Nodes',
                value: Number(jobs[0].numberOfNodesRequested),
            },
            {
                label: 'Monthly Cost',
                value: `~$${formatUsdc(costPerEpoch * 30n * (environment === 'devnet' ? 24n : 1n), 1)}`,
            },
            {
                label: 'Container Types',
                value: `${uniqueContainerTypesCount} type${uniqueContainerTypesCount > 1 ? 's' : ''}`,
            },
            {
                label: 'End Date',
                value: addTimeFn(config.genesisDate, maxPreviousEpoch).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
                tag: <SmallTag>Previous</SmallTag>,
            },
            {
                label: 'End Date',
                value: addTimeFn(config.genesisDate, maxNewEpoch).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
                tag: <SmallTag variant="blue">New</SmallTag>,
            },
        ];
    }, [costPerEpoch, duration, jobs]);

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
                        label="Pay & Extend Stack"
                    />
                </div>
            </div>

            <DeeployFlowModal ref={deeployFlowModalRef} actions={['payment']} type="extend" />
        </>
    );
}
