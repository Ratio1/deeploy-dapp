import { BorderedCard } from '@shared/cards/BorderedCard';
import clsx from 'clsx';

export default function CardWithItems({
    items,
    header,
    footer,
}: {
    items: {
        label: string;
        value: React.ReactNode;
    }[];
    header?: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <BorderedCard isLight={false}>
            {header && <>{header}</>}

            <div className="row justify-between">
                {items.map((item, index) => (
                    <Item index={index} label={item.label} value={item.value} isLast={index === items.length - 1} />
                ))}
            </div>

            {footer && <>{footer}</>}
        </BorderedCard>
    );
}

function Item({
    index,
    label,
    value,
    isLast = false,
}: {
    index: string | number;
    label: string;
    value: string | React.ReactNode;
    isLast?: boolean;
}) {
    return (
        <div key={index} className={clsx('col', isLast && 'text-right')}>
            <div className="text-[15px] font-medium text-slate-500">{label}</div>
            <div className="text-[19px] font-semibold">{value}</div>
        </div>
    );
}
