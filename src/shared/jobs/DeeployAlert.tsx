import { SmallTag } from '@shared/SmallTag';
import clsx from 'clsx';
import { ReactElement } from 'react';

export default function DeeployAlert({
    type,
    title,
    items,
}: {
    type: 'success' | 'error';
    title: ReactElement | string;
    items: { text: string; serverAlias: string }[];
}) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className={clsx('rounded-lg px-6 py-3 text-sm', {
                'bg-red-100 text-red-800': type === 'error',
                'bg-green-100 text-green-800': type === 'success',
            })}
        >
            <div className="col gap-1.5">
                <div className="font-medium">{title}</div>

                <div className="col gap-0.5">
                    {items.map((item, index) => (
                        <div key={index} className="text-[13px]">
                            <div className="row flex-wrap gap-1.5">
                                {item.text}
                                <SmallTag variant={type === 'error' ? 'darkred' : 'darkgreen'}>{item.serverAlias}</SmallTag>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
