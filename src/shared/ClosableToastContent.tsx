import { Button } from '@heroui/button';
import clsx from 'clsx';
import { FunctionComponent, JSX, PropsWithChildren } from 'react';
import toast from 'react-hot-toast';

interface Props {
    toastId: string;
    variant: 'success' | 'error';
    icon: JSX.Element;
}

export const ClosableToastContent: FunctionComponent<PropsWithChildren<Props>> = ({ children, toastId, variant, icon }) => {
    return (
        <div className="row gap-3">
            <div
                className={clsx('flex text-2xl', {
                    'text-green-600': variant === 'success',
                    'text-red-600': variant === 'error',
                })}
            >
                {icon}
            </div>

            {children}

            <Button size="sm" color="default" variant="flat" onPress={() => toast.dismiss(toastId)}>
                <div className="text-sm">Close</div>
            </Button>
        </div>
    );
};
