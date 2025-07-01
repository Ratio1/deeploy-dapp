import { Button } from '@heroui/button';
import { useModal } from 'connectkit';
import { FunctionComponent, PropsWithChildren } from 'react';
import { useAccount } from 'wagmi';

interface Props {
    classNames?: string;
    isFullWidth?: boolean;
}

export const ConnectWalletWrapper: FunctionComponent<PropsWithChildren<Props>> = ({ children, classNames, isFullWidth }) => {
    const { setOpen } = useModal();
    const { isConnected } = useAccount();

    return isConnected ? (
        <>{children}</>
    ) : (
        <Button
            className={classNames}
            fullWidth={!!isFullWidth}
            color="primary"
            onPress={() => {
                setOpen(true);
            }}
        >
            Connect Wallet
        </Button>
    );
};
