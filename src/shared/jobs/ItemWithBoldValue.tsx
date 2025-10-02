import clsx from 'clsx';
import { ReactNode } from 'react';

export default function ItemWithBoldValue({
    label,
    value,
    isLast = false,
    capitalize = false,
}: {
    label: string;
    value: string | ReactNode;
    isLast?: boolean;
    capitalize?: boolean;
}) {
    return (
        <div className={clsx('col', isLast && 'text-right')}>
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className={clsx('font-semibold', capitalize && 'capitalize')}>{value}</div>
        </div>
    );
}
