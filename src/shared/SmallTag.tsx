import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export type ColorVariant =
    | 'default'
    | 'green'
    | 'blue'
    | 'red'
    | 'orange'
    | 'emerald'
    | 'purple'
    | 'yellow'
    | 'accent'
    | 'darkred'
    | 'darkgreen'
    | 'pink'
    | 'violet'
    | 'soft';

export const SmallTag: FunctionComponent<
    PropsWithChildren<{
        variant?: ColorVariant;
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
                'bg-orange-100 text-orange-600': variant === 'orange',
                'bg-emerald-100 text-emerald-600': variant === 'emerald',
                'bg-purple-100 text-purple-600': variant === 'purple',
                'bg-orange-100 text-yellow-600': variant === 'yellow',
                'bg-blue-100': variant === 'accent',
                'bg-red-150 text-red-600': variant === 'darkred',
                'bg-green-150 text-green-600': variant === 'darkgreen',
                'bg-pink-100 text-pink-600': variant === 'pink',
                'bg-violet-100 text-violet-600': variant === 'violet',
                'bg-[#e7edf6] text-slate-500': variant === 'soft',
            })}
        >
            {children}
        </div>
    </div>
);
