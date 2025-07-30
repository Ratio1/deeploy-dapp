import clsx from 'clsx';

export default function DetailedUsage({ used, paid, total }: { used: number; paid: number; total: number }) {
    return (
        <div className="col w-full gap-2 text-xs font-medium">
            <div className="row justify-between">
                <Item label="Elapsed" value={used} color="bg-primary" />
                <Item label="Payment Covered" value={paid - used} color="bg-emerald-500" />
            </div>

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

            {total > paid && (
                <div className="row justify-end">
                    <Item label="Unpaid" value={total - paid} color="bg-slate-300" />
                </div>
            )}
        </div>
    );
}

function Item({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="row gap-1.5">
            <div className={clsx('h-2 w-2 rounded-full', color)} />

            <div className="leading-none">
                <span className="text-slate-500">{label}:</span>{' '}
                <span className="font-medium">
                    {value < 1 ? (
                        <>{'<1 month'}</>
                    ) : (
                        <>
                            {value} month{value > 1 ? 's' : ''}
                        </>
                    )}
                </span>
            </div>
        </div>
    );
}
