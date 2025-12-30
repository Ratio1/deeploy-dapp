import { ERC20Abi } from '@blockchain/ERC20';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { EthAddress } from '@typedefs/blockchain';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { RiExternalLinkLine } from 'react-icons/ri';
import { TransactionReceipt } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { BlockchainContext } from './context';

export const BlockchainProvider = ({ children }) => {
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const publicClient = usePublicClient();

    const fetchErc20Balance = (tokenAddress: EthAddress) => {
        if (publicClient && address) {
            return publicClient.readContract({
                address: tokenAddress,
                abi: ERC20Abi,
                functionName: 'balanceOf',
                args: [address],
            });
        } else {
            return Promise.resolve(0n);
        }
    };

    const watchTx = async (txHash: string, publicClient): Promise<TransactionReceipt> => {
        const waitForTx = async (): Promise<TransactionReceipt> => {
            const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 2,
            });

            if (receipt.status === 'success') {
                return receipt;
            } else {
                throw new Error('Transaction failed, please try again.');
            }
        };

        // Use the promise from waitForTx for both the toast and the return value
        const txPromise = waitForTx();

        toast.promise(
            txPromise,
            {
                loading: 'Transaction loading...',
                success: (receipt) => (
                    <div className="col">
                        <div className="font-medium">Transaction confirmed</div>
                        <div className="row gap-1 text-sm">
                            <div className="text-slate-500">View transaction details</div>
                            <Link
                                href={`${config.explorerUrl}/tx/${receipt.transactionHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary"
                            >
                                <RiExternalLinkLine className="text-lg" />
                            </Link>
                        </div>
                    </div>
                ),
                error: () => {
                    return (
                        <div className="col">
                            <div className="font-medium text-red-600">Transaction failed</div>
                            <div className="row gap-1 text-sm">
                                <div className="text-slate-500">View transaction details</div>
                                <Link
                                    href={`${config.explorerUrl}/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary"
                                >
                                    <RiExternalLinkLine className="text-lg" />
                                </Link>
                            </div>
                        </div>
                    );
                },
            },
            {
                success: {
                    duration: 6000,
                },
                error: {
                    duration: 10000,
                },
                position: 'bottom-right',
            },
        );

        // Return the same promise that the toast is watching
        return txPromise;
    };

    const fetchLicenses = async (): Promise<
        {
            licenseId: bigint;
            nodeAddress: EthAddress;
        }[]
    > => {
        if (!publicClient || !address) {
            console.log('No public client or address for fetching licenses');
            return [];
        }

        const [mndLicenses, ndLicenses] = await Promise.all([
            publicClient.readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'getLicenses',
                args: [address],
            }),
            publicClient.readContract({
                address: config.ndContractAddress,
                abi: NDContractAbi,
                functionName: 'getLicenses',
                args: [address],
            }),
        ]);

        const licenses = [...mndLicenses, ...ndLicenses];
        return licenses;
    };

    return (
        <BlockchainContext.Provider
            value={{
                watchTx,
                // Licenses
                fetchLicenses,
                // Other
                fetchErc20Balance,
            }}
        >
            {children}
        </BlockchainContext.Provider>
    );
};
