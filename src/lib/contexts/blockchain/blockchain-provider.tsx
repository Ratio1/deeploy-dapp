import { ERC20Abi } from '@blockchain/ERC20';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config } from '@lib/config';
import toast from 'react-hot-toast';
import { RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { EthAddress } from 'typedefs/blockchain';
import { TransactionReceipt } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { BlockchainContext } from './context';

export const BlockchainProvider = ({ children }) => {
    const { address } = useAccount();
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
            const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            if (receipt.status === 'success') {
                return receipt;
            } else {
                throw new Error(receipt.transactionHash);
            }
        };

        toast.promise(
            waitForTx(),
            {
                loading: 'Transaction loading...',
                success: (receipt) => (
                    <div className="col">
                        <div className="font-medium">Transaction confirmed</div>
                        <div className="row gap-1 text-sm">
                            <div className="text-slate-500">View transaction details</div>
                            <Link
                                to={`${config.explorerUrl}/tx/${receipt.transactionHash}`}
                                target="_blank"
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
                                    to={`${config.explorerUrl}/tx/${receipt.transactionHash}`}
                                    target="_blank"
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
                position: 'bottom-right',
            },
        );

        const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        if (receipt.status === 'success') {
            return receipt;
        } else {
            throw new Error('Transaction failed, please try again.');
        }
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
