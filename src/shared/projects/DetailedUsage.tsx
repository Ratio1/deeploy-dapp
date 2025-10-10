import clsx from 'clsx';

export default function DetailedUsage({
    size = 'small',
    used,
    paid,
    total,
    disableLabels = false,
}: {
    size?: 'small' | 'medium';
    used: number;
    paid: number;
    total: number;
    disableLabels?: boolean;
}) {
    return (
        <div className="col w-full gap-2 text-xs font-medium">
            {!disableLabels && (
                <div className="row justify-between">
                    <Item label="Elapsed" value={used} color="bg-primary" />
                    <Item label="Payment Covered" value={Math.max(paid - used, 0)} color="bg-emerald-500" />
                </div>
            )}

            <div
                className={clsx('relative flex w-full overflow-hidden rounded-full bg-slate-300', {
                    'h-[5px]': size === 'small',
                    'h-[6px]': size === 'medium',
                })}
            >
                <div
                    className="bg-primary absolute top-0 bottom-0 left-0 z-20 rounded-r-full transition-all"
                    style={{ width: `${Number((used * 100) / total)}%` }}
                ></div>

                <div
                    className="absolute top-0 bottom-0 left-0 z-10 rounded-r-full bg-emerald-500 transition-all"
                    style={{ width: `${Number((paid * 100) / total)}%` }}
                ></div>
            </div>

            {total > paid && !disableLabels && (
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
                <span className="font-medium">{value <= 0 ? '—' : value <= 1 ? <>{'1 epoch'}</> : <>{value} epochs</>}</span>
            </div>
        </div>
    );
}
