import clsx from 'clsx';
import { JSX } from 'react';

export const CardItem = ({
    label,
    value,
    isBold = false,
}: {
    label: JSX.Element | string;
    value: JSX.Element | string | bigint | number | (() => JSX.Element | string);
    isBold?: boolean;
}) => {
    return (
        <div className="col text-sm">
            <div className="block leading-5 lg:hidden">{label}</div>
            <div className={clsx('lg:text-body leading-5 text-slate-400', { 'font-medium': isBold })}>
                {typeof value === 'function' ? value() : value}
            </div>
        </div>
    );
};
