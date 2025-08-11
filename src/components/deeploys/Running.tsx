import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { getApps } from '@lib/api/deeploy';
import { escrowContractAddress } from '@lib/config';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { EthAddress } from '@typedefs/blockchain';
import { RunningJob } from '@typedefs/deeploys';
import _ from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';
import { RiDraftLine, RiRefreshLine } from 'react-icons/ri';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';
import RunningCard from './RunningCard';

export interface RunningRef {
    expandAll: () => void;
    collapseAll: () => void;
}

const Running = forwardRef<RunningRef, { setProjectsCount: (count: number) => void }>(({ setProjectsCount }, ref) => {
    const [isLoading, setLoading] = useState(true);

    const [projects, setProjects] = useState<Record<string, RunningJob[]>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const [isRefreshRequired, setRefreshRequired] = useState<boolean>(true);
    const [isRefreshing, setRefreshing] = useState<boolean>(false);

    const publicClient = usePublicClient();
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        if (publicClient) {
            fetchRunningJobs();
        }
    }, [publicClient]);

    useEffect(() => {
        if (projects) {
            const obj = {};

            Object.keys(projects).forEach((projectHash) => {
                obj[projectHash] = true;
            });

            setExpanded(obj);
        }
    }, [projects]);

    const fetchRunningJobs = async () => {
        if (!publicClient) {
            return;
        }

        const jobs: readonly RunningJob[] = await publicClient.readContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'getAllJobs',
        });

        const projects = _.groupBy(jobs, 'projectHash');
        console.log('[Running] Projects:', projects);

        setProjects(projects);
        setProjectsCount(Object.keys(projects).length);

        setLoading(false);
    };

    const fetchApps = async () => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        setRefreshing(true);

        try {
            const request = await signAndBuildRequest(address);
            const response = await getApps(request);
            toast.success('Running jobs refreshed successfully.');

            console.log('[Running] fetchApps', response);

            setRefreshRequired(false);
        } catch (error) {
            console.error('[Running] fetchApps', error);
            toast.error('Failed to refresh running jobs.');
        } finally {
            setRefreshing(false);
        }
    };

    const signAndBuildRequest = async (address: EthAddress) => {
        const nonce = generateNonce();

        const message = buildDeeployMessage({
            nonce,
        });

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        return request;
    };

    const expandAll = () => {
        if (projects) {
            const expanded = {};

            Object.keys(projects).forEach((projectHash) => {
                expanded[projectHash] = true;
            });

            setExpanded(expanded);
        }
    };

    const collapseAll = () => {
        if (projects) {
            const collapsed = {};

            Object.keys(projects).forEach((projectHash) => {
                collapsed[projectHash] = false;
            });

            setExpanded(collapsed);
        }
    };

    useImperativeHandle(ref, () => ({
        expandAll,
        collapseAll,
    }));

    return (
        <div className="list">
            <ListHeader>
                <div className="row gap-6">
                    <div className="min-w-[232px]">ID</div>
                    <div className="min-w-[80px]">Details</div>
                    <div className="min-w-[164px]">End Date</div>
                    <div className="min-w-[200px]">Usage</div>
                </div>

                <div className="min-w-[124px]">Next payment due</div>
            </ListHeader>

            {isRefreshRequired && (
                <div className="text-warning-800 bg-warning-100 rounded-lg px-6 py-3 text-sm">
                    <div className="row justify-between gap-4">
                        <div className="row gap-1.5">
                            <RiRefreshLine className="text-xl" />
                            <div className="font-medium">Refresh required</div>
                        </div>

                        <div>
                            <Button
                                className="bg-warning-300 rounded-md"
                                color="warning"
                                size="sm"
                                onPress={fetchApps}
                                isLoading={isRefreshing}
                            >
                                <div className="text-[13px]">Refresh</div>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="min-h-[104px] w-full rounded-lg" />
                    ))}
                </>
            ) : (
                <>
                    {_.entries(projects).map(([projectHash, jobs], index) => (
                        <div key={index}>
                            <RunningCard
                                projectHash={projectHash}
                                jobs={jobs}
                                expanded={expanded[projectHash]}
                                toggle={() => setExpanded({ ...expanded, [projectHash]: !expanded[projectHash] })}
                            />
                        </div>
                    ))}
                </>
            )}

            {_.isEmpty(projects) && !isLoading && (
                <div className="center-all w-full p-14">
                    <EmptyData
                        title="No running jobs"
                        description="Deployed projects will be displayed here"
                        icon={<RiDraftLine />}
                    />
                </div>
            )}
        </div>
    );
});

Running.displayName = 'Running';

export default Running;
