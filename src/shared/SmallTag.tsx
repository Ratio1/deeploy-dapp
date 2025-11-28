import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export type ColorVariant =
    | 'slate'
    | 'green'
    | 'blue'
    | 'red'
    | 'orange'
    | 'emerald'
    | 'purple'
    | 'yellow'
    | 'darkred'
    | 'darkgreen'
    | 'pink'
    | 'violet'
    | 'lightslate'
    | 'teal'
    | 'cyan'
    | 'fuchsia'
    | 'gray';

export const SmallTag: FunctionComponent<
    PropsWithChildren<{
        variant?: ColorVariant;
        isLarge?: boolean;
    }>
> = ({ children, variant = 'slate', isLarge = false }) => (
    <div className="flex">
        <div
            className={clsx('center-all rounded-md px-1.5 py-0.5 font-medium', {
                'text-xs': !isLarge,
                'text-sm': isLarge,
                'bg-slate-200 text-slate-700': variant === 'slate',
                'bg-green-100 text-green-600': variant === 'green',
                'bg-blue-100 text-blue-600': variant === 'blue',
                'bg-red-100 text-red-600': variant === 'red',
                'bg-orange-100 text-orange-600': variant === 'orange',
                'bg-emerald-100 text-emerald-600': variant === 'emerald',
                'bg-purple-100 text-purple-600': variant === 'purple',
                'bg-orange-100 text-yellow-600': variant === 'yellow',
                'bg-red-150 text-red-600': variant === 'darkred',
                'bg-green-150 text-green-600': variant === 'darkgreen',
                'bg-pink-100 text-pink-600': variant === 'pink',
                'bg-violet-100 text-violet-600': variant === 'violet',
                'bg-[#e7edf6] text-slate-500': variant === 'lightslate',
                'bg-teal-100 text-teal-600': variant === 'teal',
                'bg-cyan-100 text-cyan-600': variant === 'cyan',
                'bg-fuchsia-100 text-fuchsia-600': variant === 'fuchsia',
                'bg-gray-200 text-gray-600': variant === 'gray',
            })}
        >
            {children}
        </div>
    </div>
);
