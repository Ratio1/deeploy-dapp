export default function ListHeader({ children, label }) {
    return (
        <div className="hidden w-full items-center justify-between gap-3 rounded-xl border-2 border-slate-100 bg-slate-100 px-4 py-4 text-sm font-medium text-slate-400 lg:flex lg:gap-6 lg:px-6">
            <div className="col w-full gap-4">
                {label}

                <div className="flex w-full justify-between">{children}</div>
            </div>
        </div>
    );
}
