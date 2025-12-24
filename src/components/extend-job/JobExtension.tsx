'use client';

import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import { formatResourcesSummary } from '@data/containerResources';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { extendJobDurationCash } from '@lib/cash/api';
import { config, environment } from '@lib/config';
import { addTimeFn, formatUsdc, getResourcesCostPerEpoch } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import CostAndDurationInterface from '@shared/jobs/CostAndDurationInterface';
import PayButtonWithAllowance from '@shared/jobs/PayButtonWithAllowance';
import { SmallTag } from '@shared/SmallTag';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { max } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function JobExtension({ job }: { job: RunningJobWithResources }) {
    const router = useRouter();

    const costPerEpoch: bigint = useMemo(() => {
        return (
            job.numberOfNodesRequested * getResourcesCostPerEpoch(job.resources.containerOrWorkerType, job.resources.gpuType)
        );
    }, [job]);

    const [duration, setDuration] = useState<number>(12); // In months
    const [totalCost, setTotalCost] = useState<bigint>(0n);
    const [isLoading, setLoading] = useState<boolean>(false);

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number, messagesToSign: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const onSubmit = async () => {
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
        const response = await extendJobDurationCash({
            jobId: job.id.toString(),
            lastExecutionEpoch: job.lastExecutionEpoch.toString(),
            durationMonths: duration,
        });

        return response.status;
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
