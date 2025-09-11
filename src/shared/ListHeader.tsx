import { PropsWithChildren } from 'react';

export default function ListHeader({ children }: PropsWithChildren) {
    return (
        <div className="hidden w-full rounded-xl border-2 border-slate-100 bg-slate-100 px-4 py-4 text-slate-500 lg:flex lg:gap-6 lg:px-6">
            <div className="compact flex w-full justify-between">{children}</div>
        </div>
    );
}
