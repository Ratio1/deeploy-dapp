import clsx from 'clsx';
import { JSX } from 'react';

export const CardItem = ({
    label,
    value,
    isBold = false,
}: {
    label: JSX.Element | string;
    value: JSX.Element | string | bigint | number;
    isBold?: boolean;
}) => {
    return (
        <div className="col text-sm">
            <div className="block leading-5 lg:hidden">{label}</div>
            <div className={clsx('leading-5 text-slate-400 lg:text-body', { 'font-medium': isBold })}>{value}</div>
        </div>
    );
};
