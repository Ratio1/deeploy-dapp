import { JSX, PropsWithChildren } from 'react';

interface Props {
    label?: JSX.Element;
}

export default function ListHeader({ children, label }: PropsWithChildren<Props>) {
    return (
        <div className="compact hidden w-full items-center justify-between gap-3 rounded-xl border-2 border-slate-100 bg-slate-100 px-4 py-4 text-slate-500 lg:flex lg:gap-6 lg:px-6">
            <div className="col w-full gap-5">
                {label}

                <div className="flex w-full justify-between">{children}</div>
            </div>
        </div>
    );
}
