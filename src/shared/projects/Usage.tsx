import clsx from 'clsx';

export default function Usage({ used, total, isColored = false }: { used: number; total: number; isColored?: boolean }) {
    return (
        <div className="col w-full gap-1.5 text-xs font-medium">
            <div className="row justify-between leading-none">
                <div>
                    {used}/{total} months
                </div>

                <div>{parseFloat(((used / total) * 100).toFixed(2))}%</div>
            </div>

            <div className="flex h-[5px] w-full overflow-hidden rounded-full bg-gray-300">
                <div
                    className={clsx('bg-primary rounded-full transition-all', {
                        'bg-emerald-500!': isColored && used < total / 2,
                        'bg-yellow-500!': isColored && used >= total / 2 && total - used > 1,
                        'bg-red-600!': isColored && total - used === 1,
                    })}
                    style={{ width: `${Number((used * 100) / total)}%` }}
                ></div>
            </div>
        </div>
    );
}
