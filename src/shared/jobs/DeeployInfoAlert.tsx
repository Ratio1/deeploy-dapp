import clsx from 'clsx';
import { ReactNode } from 'react';
import { RiInformationLine } from 'react-icons/ri';

export default function DeeployInfoAlert({
    variant = 'blue',
    title,
    description,
    isCompact = true,
}: {
    variant?: 'blue' | 'green';
    title: ReactNode;
    description: ReactNode;
    isCompact?: boolean;
}) {
    return (
        <div
            className={clsx('col gap-2 rounded-md text-sm', {
                'px-3 py-3': isCompact,
                'px-4 py-4 lg:px-6': !isCompact,
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
