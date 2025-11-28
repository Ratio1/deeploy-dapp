import clsx from 'clsx';
import { RiCloseFill, RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function DeeploySuccessAlert({
    items,
    onClose,
    isCompact,
}: {
    items: { text: string; serverAlias: string; tunnelURL?: string }[];
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

                <div className="col gap-1">
                    {items.map((item, index) => (
                        <div key={index} className="row gap-1.5">
                            <div>{item.text}</div>
                            <div>•</div>
                            <div>{item.serverAlias}</div>
                            <div>•</div>

                            {item.tunnelURL && (
                                <Link
                                    to={`https://${item.tunnelURL}`}
                                    target="_blank"
                                    className="row gap-1 text-[13px] text-green-500 hover:opacity-70"
                                >
                                    <span className="font-roboto-mono">{item.tunnelURL}</span>
                                    <RiExternalLinkLine className="mb-px text-[14px]" />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
