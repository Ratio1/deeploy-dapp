import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export const BorderedCard: FunctionComponent<
    PropsWithChildren<{
        isHoverable?: boolean;
        isLight?: boolean;
        isBorderDark?: boolean;
        disableWrapper?: boolean;
        onClick?: () => void;
    }>
> = ({ children, isHoverable, isLight = true, isBorderDark, disableWrapper, onClick }) => {
    return (
        <div
            className={clsx('flex w-full overflow-hidden rounded-xl border-2 bg-slate-100', {
                'cursor-pointer hover:border-slate-200': isHoverable,
                'border-slate-100': !isBorderDark,
                'border-slate-150': isBorderDark,
            })}
            onClick={onClick}
        >
            <div
                className={clsx('col w-full', {
                    'bg-[#fdfdfd]': isLight,
                    'gap-4 px-4 py-4 lg:px-6': !disableWrapper,
                })}
            >
                {children}
            </div>
        </div>
    );
};
