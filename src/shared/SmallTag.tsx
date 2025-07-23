import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export const SmallTag: FunctionComponent<
    PropsWithChildren<{
        variant?: 'default' | 'green' | 'blue' | 'red' | 'orange';
        isLarge?: boolean;
    }>
> = ({ children, variant = 'default', isLarge = false }) => (
    <div className="flex">
        <div
            className={clsx('center-all rounded-md px-1.5 py-0.5 font-medium', {
                'text-xs': !isLarge,
                'text-sm': isLarge,
                'bg-slate-200 text-slate-700': variant === 'default',
                'bg-green-100 text-green-600': variant === 'green',
                'bg-blue-100 text-blue-600': variant === 'blue',
                'bg-red-100 text-red-600': variant === 'red',
                'bg-orange-50 text-orange-600': variant === 'orange',
            })}
        >
            {children}
        </div>
    </div>
);
