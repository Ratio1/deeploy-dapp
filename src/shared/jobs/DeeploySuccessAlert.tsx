import clsx from 'clsx';
import { RiCloseFill } from 'react-icons/ri';

export default function DeeploySuccessAlert({
    items,
    onClose,
    isCompact,
}: {
    items: { text: string; serverAlias: string }[];
    onClose: () => void;
    isCompact?: boolean;
}) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className={clsx('relative rounded-lg border-2 border-green-100 bg-green-100 py-3 text-sm text-green-800', {
                'px-4': isCompact,
                'px-6': !isCompact,
            })}
        >
            <div className="absolute top-1.5 right-1 cursor-pointer rounded-full p-1 hover:bg-black/5" onClick={onClose}>
                <RiCloseFill className="text-lg" />
            </div>

            <div className="col gap-1.5">
                <div className="font-medium">
                    The following {items.length > 1 ? 'jobs were' : 'job was'} deployed successfully:
                </div>

                <div className="col gap-0.5">
                    {items.map((item, index) => (
                        <div key={index} className="row gap-1">
                            <div>{item.text}</div>
                            <div className="text-green-600">/</div>
                            <div className="text-green-600">{item.serverAlias}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
