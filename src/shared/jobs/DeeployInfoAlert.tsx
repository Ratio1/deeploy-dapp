import clsx from 'clsx';
import { ReactNode } from 'react';
import { RiInformationLine } from 'react-icons/ri';

export default function DeeployInfoAlert({
    variant = 'blue',
    title,
    description,
    size = 'md',
    isRoundedLg = false,
}: {
    variant?: 'blue' | 'green';
    title: ReactNode;
    description: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    isRoundedLg?: boolean;
}) {
    return (
        <div
            className={clsx('col gap-2 text-sm', {
                'rounded-md': !isRoundedLg,
                'rounded-lg': isRoundedLg,
                'p-3': size === 'sm',
                'px-4 py-3': size === 'md',
                'px-4 py-4 lg:px-6': size === 'lg',
                'bg-blue-100 text-blue-600': variant === 'blue',
                'bg-green-100 text-green-600': variant === 'green',
            })}
        >
            <div className="row gap-1.5">
                <RiInformationLine className="text-[20px]" />

                {title}
            </div>

            <div>{description}</div>
        </div>
    );
}
