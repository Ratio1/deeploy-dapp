import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { escrowContractAddress } from '@lib/config';
import ListHeader from '@shared/ListHeader';
import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';

export default function Jobs() {
    const publicClient = usePublicClient();

    useEffect(() => {
        fetchAllJobs();
    }, []);

    const fetchAllJobs = async () => {
        if (publicClient) {
            const jobs = await publicClient.readContract({
                address: escrowContractAddress,
                abi: CspEscrowAbi,
                functionName: 'getAllJobs',
            });

            console.log('[Jobs] jobs', jobs);
        }
    };

    return (
        <div className="list">
            <ListHeader>
                <div className="min-w-[82px]">ID</div>

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </ListHeader>

            <div>Jobs</div>
        </div>
    );
}
