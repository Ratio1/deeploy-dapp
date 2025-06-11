import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export const SmallTag: FunctionComponent<
    PropsWithChildren<{
        variant?: 'green' | 'blue';
    }>
> = ({ children, variant = 'green' }) => (
    <div className="flex">
        <div
            className={clsx('center-all rounded-md px-1.5 py-0.5 text-xs font-medium', {
                'bg-green-100 text-green-600': variant === 'green',
                'bg-blue-100 text-blue-600': variant === 'blue',
            })}
        >
            {children}
        </div>
    </div>
);
