import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    title?: string;
    label?: React.ReactNode;
}

export const SlateCard: FunctionComponent<PropsWithChildren<Props>> = ({ children, title, label }) => {
    return (
        <div className="col justify-center gap-4 rounded-lg bg-slate-100 px-4 py-5">
            {title && (
                <div className="row justify-between">
                    <div className="text-[17px] leading-none font-medium">{title}</div>
                    {label && <>{label}</>}
                </div>
            )}

            <div className="col gap-4">{children}</div>
        </div>
    );
};
