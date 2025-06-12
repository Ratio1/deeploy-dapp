import clsx from 'clsx';
import { FunctionComponent, PropsWithChildren } from 'react';

export const BorderedCard: FunctionComponent<
    PropsWithChildren<{
        isHoverable?: boolean;
    }>
> = ({ children, isHoverable }) => {
    return (
        <div
            className={clsx('flex w-full overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-100', {
                'cursor-pointer hover:border-slate-200': isHoverable,
            })}
        >
            <div className="col w-full gap-4 bg-light px-4 py-4 lg:gap-5 lg:px-6">{children}</div>
        </div>
    );
};
