import clsx from 'clsx';
import { FunctionComponent, JSX, PropsWithChildren } from 'react';

interface Props {
    variant?: 'primary' | 'red';
    icon: JSX.Element;
    title: string;
    description: JSX.Element;
    largeTitle?: boolean;
    fullWidth?: boolean;
    isCompact?: boolean;
}

export const DetailedAlert: FunctionComponent<PropsWithChildren<Props>> = ({
    children,
    variant = 'primary',
    icon,
    title,
    description,
    largeTitle = false,
    fullWidth = false,
    isCompact = false,
}) => {
    const bgColorClass = {
        primary: 'bg-primary-100',
        red: 'bg-red-100',
    };

    const textColorClass = {
        primary: 'text-primary-500',
        red: 'text-red-500',
    };

    return (
        <div className={clsx('col items-center', { 'gap-4': isCompact, 'gap-6': !isCompact })}>
            <div className={`center-all rounded-full ${bgColorClass[variant]} p-4`}>
                <div className={`text-3xl ${textColorClass[variant]}`}>{icon}</div>
            </div>

            <div className={clsx('col text-center', { 'gap-1': isCompact, 'gap-2': !isCompact })}>
                <div
                    className={clsx('text-primary-800 font-bold tracking-wider uppercase', {
                        'text-xl': !largeTitle,
                        'text-4xl': largeTitle,
                    })}
                >
                    {title}
                </div>

                <div className="text-slate-500">{description}</div>

                {!!children && <div className={clsx('mx-auto pt-4', { 'w-full': fullWidth })}>{children}</div>}
            </div>
        </div>
    );
};
