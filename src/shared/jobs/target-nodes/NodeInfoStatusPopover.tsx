import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Spinner } from '@heroui/spinner';
import { RiInformationLine } from 'react-icons/ri';
import { getInfoIconClassName, NODE_ADDRESS_REGEX, NodeInfoState } from './nodeInfo';

export default function NodeInfoStatusPopover({
    nodeInfoState,
    normalizedValue,
    ariaLabel,
}: {
    nodeInfoState: NodeInfoState | undefined;
    normalizedValue: string;
    ariaLabel: string;
}) {
    const nodeInfo = nodeInfoState?.info;

    if (nodeInfoState?.status === 'loading') {
        return <Spinner size="sm" className="scale-75" />;
    }

    return (
        <Popover placement="top" offset={10}>
            <PopoverTrigger>
                <button
                    type="button"
                    className={`cursor-pointer transition-opacity hover:opacity-60 ${getInfoIconClassName(nodeInfoState)}`}
                    aria-label={ariaLabel}
                >
                    <RiInformationLine className="text-[18px]" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="max-w-[260px] p-3">
                <div className="col gap-1.5 text-sm">
                    <div className="font-medium">Node Info</div>

                    {!normalizedValue && <div className="text-slate-500">Enter a node address to view info.</div>}

                    {!!normalizedValue && !NODE_ADDRESS_REGEX.test(normalizedValue) && (
                        <div className="text-slate-500">Enter a valid 0xai_ address to query node info.</div>
                    )}

                    {!!normalizedValue && NODE_ADDRESS_REGEX.test(normalizedValue) && nodeInfoState?.status === 'idle' && (
                        <div className="text-slate-500">Leave the field to query node info.</div>
                    )}

                    {nodeInfoState?.status === 'error' && (
                        <>
                            <div>
                                Recognized: <span className="font-medium">No</span>
                            </div>
                            <div>
                                Online: <span className="font-medium">Unknown</span>
                            </div>
                            <div>
                                Alias: <span className="font-medium">-</span>
                            </div>
                        </>
                    )}

                    {nodeInfoState?.status === 'loaded' && (
                        <>
                            <div>
                                Recognized: <span className="font-medium">{nodeInfo?.node_is_recognized ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                                Online:{' '}
                                <span className="font-medium">
                                    {nodeInfo?.node_is_online === null ? 'Unknown' : nodeInfo?.node_is_online ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div>
                                Alias: <span className="font-medium">{nodeInfo?.node_alias || '-'}</span>
                            </div>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
