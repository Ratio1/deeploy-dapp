import { ERC20Abi } from '@blockchain/ERC20';
import { Skeleton } from '@heroui/skeleton';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { fBI, sleep } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line } from 'react-icons/ri';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

interface PayButtonWithAllowanceRef {
    fetchAllowance: () => Promise<bigint | undefined>;
}

type PayButtonWithAllowanceProps = {
    totalCost: bigint;
    isLoading: boolean;
    setLoading: (isLoading: boolean) => void;
    buttonType?: 'button' | 'submit';
    callback?: () => Promise<void>;
    isButtonDisabled?: boolean;
    label?: string;
};

const PayButtonWithAllowance = forwardRef<PayButtonWithAllowanceRef, PayButtonWithAllowanceProps>(
    function PayButtonWithAllowance(
        { totalCost, isLoading, setLoading, buttonType = 'button', callback, isButtonDisabled = false, label = 'Pay & Deploy' },
        ref,
    ) {
        const { watchTx } = useBlockchainContext() as BlockchainContextType;
        const { escrowContractAddress } = useDeploymentContext() as DeploymentContextType;

        const [allowance, setAllowance] = useState<bigint | undefined>();

        const { data: walletClient } = useWalletClient();
        const publicClient = usePublicClient();
        const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

        const approve = async () => {
            if (!walletClient || !publicClient || !address || !escrowContractAddress) {
                toast.error('Please refresh this page and try again.');
                return;
            }

            setLoading(true);

            try {
                const txHash = await walletClient.writeContract({
                    address: config.usdcContractAddress,
                    abi: ERC20Abi,
                    functionName: 'approve',
                    args: [escrowContractAddress, totalCost],
                });

                const receipt = await watchTx(txHash, publicClient);

                if (receipt.status === 'success') {
                    await sleep(250); // Wait for the allowance to be updated
                    await fetchAllowance();
                } else {
                    toast.error('Approval failed, please try again.');
                }
            } catch (error) {
                console.error(error);
                toast.error('Approval failed, please try again.');
            } finally {
                setLoading(false);
            }
        };

        const fetchAllowance = useCallback(async (): Promise<bigint | undefined> => {
            if (!publicClient || !address || !escrowContractAddress) {
                toast.error('Please refresh this page and try again.');
                return;
            }

            const result = await publicClient.readContract({
                address: config.usdcContractAddress,
                abi: ERC20Abi,
                functionName: 'allowance',
                args: [address, escrowContractAddress],
            });

            console.log(`Allowance: ${fBI(result, 6, 2)} $USDC`);

            setAllowance(result);
            setLoading(false);
            return result;
        }, [address, escrowContractAddress, publicClient, setLoading]);

        useImperativeHandle(
            ref,
            () => ({
                fetchAllowance,
            }),
            [fetchAllowance],
        );

        useEffect(() => {
            if (publicClient && address) {
                fetchAllowance();
            }
        }, [address, publicClient, fetchAllowance]);

        const hasEnoughAllowance = (): boolean => allowance !== undefined && allowance >= totalCost;

        const isApprovalRequired = (): boolean => !hasEnoughAllowance();

        const onPress = async () => {
            if (isApprovalRequired()) {
                await approve();
            } else {
                await callback?.();
            }
        };

        const isPayAndDeployButtonDisabled = (): boolean => {
            return !publicClient || allowance === undefined || isButtonDisabled;
        };

        if (allowance === undefined) {
            return <Skeleton className="h-[38px] w-[144px] rounded-[10px]" />;
        }

        return (
            <ConnectWalletWrapper>
                <ActionButton
                    type={buttonType}
                    color="primary"
                    variant="solid"
                    onPress={onPress}
                    isDisabled={isPayAndDeployButtonDisabled()}
                    isLoading={isLoading}
                >
                    <div className="row gap-1.5">
                        {!isApprovalRequired() && <RiBox3Line className="text-lg" />}
                        <div className="text-sm">{isApprovalRequired() ? 'Approve $USDC' : label}</div>
                    </div>
                </ActionButton>
            </ConnectWalletWrapper>
        );
    },
);

PayButtonWithAllowance.displayName = 'PayButtonWithAllowance';

export default PayButtonWithAllowance;
