import clsx from 'clsx';
import {  environment } from '@lib/config';

export default function Usage({ used, total, isColored = false }: { used: number; total: number; isColored?: boolean }) {
    const warningThreshold = environment === 'devnet' ? 15 * 24 : 15;
    const remainingEpochs = total - used;

    return (
        <div className="col w-full gap-1.5 text-xs font-medium">
            <div className="row justify-between leading-none">
                <div>
                    {Math.min(used, total)}/{total} epochs
                </div>

                <div>{parseFloat(((Math.min(used, total) / total) * 100).toFixed(2))}%</div>
            </div>

            <div className="flex h-[5px] w-full overflow-hidden rounded-full bg-gray-300">
                <div
                    className={clsx('bg-primary rounded-full transition-all', {
                        'bg-emerald-500!': isColored && used >= total,
                        'bg-yellow-500!': isColored && remainingEpochs < warningThreshold && used < total,
                    })}
                    style={{ width: `${Number((used * 100) / total)}%` }}
                ></div>
            </div>
        </div>
    );
}
