import { Button } from '@heroui/button';
import { config } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { SlateCard } from '@shared/cards/SlateCard';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiCheckLine, RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { useAccount, useSignMessage } from 'wagmi';

const SUMMARY_ITEMS = [
    {
        label: 'Application Type',
        value: 'Web App',
    },
    {
        label: 'Nodes',
        value: '12',
    },
    {
        label: 'GPU/CPU',
        value: 'CPU',
    },
    // {
    //     label: 'Configuration',
    //     value: 'ENTRY (1 core, 2 GB)',
    // },
    {
        label: 'Container Type',
        value: 'ENTRY',
    },
    {
        label: 'Configuration',
        value: '1 core, 2 GB',
    },
    {
        label: 'Expiration Date',
        value: new Date('2027-07-01').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    },
];

function Payment() {
    const { isPaymentConfirmed, setPaymentConfirmed } = useDeploymentContext() as DeploymentContextType;

    const { address, isConnected } = useAccount();
    const { signMessage, isPending: isSigning } = useSignMessage({
        mutation: {
            onSuccess: (_data) => {
                toast.promise(
                    new Promise((resolve) => {
                        setTimeout(() => {
                            setLoading(false);
                            setPaymentConfirmed(true);
                            resolve({ transactionHash: '0x' });
                        }, 1000);
                    }),
                    {
                        loading: 'Transaction loading...',
                        success: (receipt) => (
                            <div className="col">
                                <div className="font-medium">Transaction confirmed</div>
                                <div className="row gap-1 text-sm">
                                    <div className="text-slate-500">View transaction details</div>
                                    <Link to={`${config.explorerUrl}`} target="_blank" className="text-primary">
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
                                        <Link to={`${config.explorerUrl}`} target="_blank" className="text-primary">
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
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to confirm transaction.');
                setLoading(false);
            },
        },
    });

    const [isLoading, setLoading] = useState(false);

    const handleConfirmTransaction = async () => {
        if (!isConnected || !address) {
            toast.error('Please connect your wallet first');
            return;
        }

        setLoading(true);

        const message = `Confirm Deeploy payment transaction for ${address}. Amount: 1250 $USDC. Timestamp: ${Date.now()}.`;

        signMessage({ message });
    };

    return (
        <div className="col gap-2">
            <div className="grid h-full w-full grid-cols-3 gap-2">
                {/*
                {item.label === 'Configuration' ? (
                    <div className="col text-center font-semibold">
                        <div className="text-base">{item.value.split(' ')[0]}</div>
                        <div className="text-base">{item.value.slice(item.value.split(' ')[0].length)}</div>
                    </div>
                )}
            */}

                {SUMMARY_ITEMS.map((item) => (
                    <SlateCard key={item.label}>
                        <div className="col justify-center gap-1 py-2 text-center">
                            <div className="text-lg font-semibold">{item.value}</div>
                            <div className="text-sm font-medium text-slate-500">{item.label}</div>
                        </div>
                    </SlateCard>
                ))}
            </div>

            <SlateCard>
                <div className="row justify-between gap-8 p-2">
                    <div className="text-[20px] font-semibold text-primary">
                        <span className="text-slate-400">$USDC</span> 1250
                    </div>

                    {!isPaymentConfirmed ? (
                        <ConnectWalletWrapper classNames="h-9 px-3.5 rounded-lg">
                            <Button
                                className="h-9 px-3.5"
                                color="primary"
                                variant="solid"
                                size="sm"
                                onPress={handleConfirmTransaction}
                                isLoading={isLoading || isSigning}
                            >
                                <div className="text-sm">
                                    {isLoading || isSigning ? 'Confirm in wallet' : 'Confirm Transaction'}
                                </div>
                            </Button>
                        </ConnectWalletWrapper>
                    ) : (
                        <div className="row h-9 rounded-lg bg-[#c8fcda] px-3.5">
                            <div className="row gap-1 text-green-600">
                                <RiCheckLine className="text-xl" />
                                <div className="text-sm font-medium">Payment Confirmed</div>
                            </div>
                        </div>
                    )}
                </div>
            </SlateCard>
        </div>
    );
}

export default Payment;
