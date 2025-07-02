import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    title?: string;
}

export const SlateCard: FunctionComponent<PropsWithChildren<Props>> = ({ children, title }) => {
    return (
        <div className="col justify-center gap-4 rounded-lg bg-slate-100 px-4 py-5">
            {title && <div className="text-[17px] font-medium leading-none">{title}</div>}

            <div className="col gap-4">{children}</div>
        </div>
    );
};
