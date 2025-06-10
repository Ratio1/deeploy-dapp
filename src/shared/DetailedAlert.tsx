import clsx from 'clsx';
import { FunctionComponent, JSX, PropsWithChildren } from 'react';

interface Props {
    variant?: 'primary' | 'red';
    icon: JSX.Element;
    title: string;
    description: JSX.Element;
    largeTitle?: boolean;
}

export const DetailedAlert: FunctionComponent<PropsWithChildren<Props>> = ({
    children,
    variant = 'primary',
    icon,
    title,
    description,
    largeTitle = false,
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
        <div className="center-all col gap-6 py-4">
            <div className={`center-all rounded-full ${bgColorClass[variant]} p-5`}>
                <div className={`text-3xl ${textColorClass[variant]}`}>{icon}</div>
            </div>

            <div className="col gap-1 text-center">
                <div
                    className={clsx('text-primary-800 font-bold uppercase tracking-wider', {
                        'text-3xl': largeTitle,
                    })}
                >
                    {title}
                </div>

                <div className="text-slate-500">{description}</div>

                {!!children && <div className="mx-auto pt-4">{children}</div>}
            </div>
        </div>
    );
};
