import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    variant?: 'default' | 'white';
    fullWidth?: boolean;
}

export const BigCard: FunctionComponent<PropsWithChildren<Props>> = ({ children, variant = 'default', fullWidth }) => {
    return (
        <div
            className={clsx('col gap-4 rounded-xl px-6 py-4', {
                'w-full': fullWidth,
                'bg-slate-100': variant === 'default',
                'border-3 border-slate-100 bg-white': variant === 'white',
            })}
        >
            {children}
        </div>
    );
};
