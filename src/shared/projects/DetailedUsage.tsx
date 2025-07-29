import clsx from 'clsx';

export default function DetailedUsage({ used, paid, total }: { used: number; paid: number; total: number }) {
    return (
        <div className="col w-full gap-2 text-xs font-medium">
            <div className="relative flex h-[5px] w-full overflow-hidden rounded-full bg-slate-300">
                <div
                    className="bg-primary absolute top-0 bottom-0 left-0 z-20 rounded-r-full transition-all"
                    style={{ width: `${Number((used * 100) / total)}%` }}
                ></div>

                <div
                    className="absolute top-0 bottom-0 left-0 z-10 rounded-r-full bg-emerald-500 transition-all"
                    style={{ width: `${Number((paid * 100) / total)}%` }}
                ></div>
            </div>

            <div className="row justify-between">
                <Item label="Used" value={used} color="bg-primary" />
                <Item label="Paid" value={paid} color="bg-emerald-500" />
                <Item label="To be paid" value={total - paid} color="bg-slate-300" />
            </div>
        </div>
    );
}

function Item({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="row gap-1.5">
            <div className={clsx('h-2 w-2 rounded-full', color)} />

            <div className="leading-none">
                <span className="text-slate-500">{label}:</span> <span className="font-medium">{value} months</span>
            </div>
        </div>
    );
}
