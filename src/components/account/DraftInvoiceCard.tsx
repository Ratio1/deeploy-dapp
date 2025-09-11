import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithLabel from '@shared/ItemWithLabel';
import { InvoiceDraft } from '@typedefs/general';
import { RiArrowRightLine } from 'react-icons/ri';

export default function DraftInvoiceCard({
    draft,
    isExpanded,
    toggle,
}: {
    draft: InvoiceDraft;
    isExpanded: boolean;
    toggle: () => void;
}) {
    return (
        <BorderedCard isHoverable onClick={toggle}>
            <div className="col gap-4">
                {/* Content */}
                <div className="row justify-between gap-3 text-sm lg:gap-6">
                    <div className="min-w-[62px] font-medium">{draft.invoiceNumber}</div>

                    <div className="min-w-[122px]">
                        {new Date(draft.creationTimestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>

                    <div className="max-w-[170px] min-w-[170px] truncate">{draft.nodeOwnerName}</div>

                    <div className="min-w-[118px] font-medium">${draft.totalUsdcAmount.toFixed(2)}</div>

                    <div
                        className="min-w-[92px]"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            console.log('Download', draft.invoiceId);
                        }}
                    >
                        <div className="row cursor-pointer gap-1 hover:opacity-50">
                            <div className="compact">Download</div>
                            <RiArrowRightLine className="mt-px text-lg" />
                        </div>
                    </div>
                </div>

                {/* Details */}
                {isExpanded && (
                    <div className="col bg-slate-75 gap-2.5 rounded-lg px-5 py-4">
                        <div className="text-base font-semibold">Details</div>

                        <div className="row justify-between gap-2">
                            <ItemWithLabel
                                label="Node Operator Addr."
                                value={
                                    <CopyableValue value={draft.userAddress}>
                                        <div className="text-sm text-slate-400">
                                            {getShortAddressOrHash(draft.userAddress, 4)}
                                        </div>
                                    </CopyableValue>
                                }
                            />

                            <ItemWithLabel
                                label="Invoice Series"
                                value={<div className="font-medium capitalize">{draft.invoiceSeries}</div>}
                            />

                            <ItemWithLabel
                                label="Invoice ID"
                                value={
                                    <CopyableValue value={draft.invoiceId}>
                                        <div className="text-sm text-slate-400">
                                            {getShortAddressOrHash(draft.invoiceId, 8)}
                                        </div>
                                    </CopyableValue>
                                }
                            />
                        </div>
                    </div>
                )}
            </div>
        </BorderedCard>
    );
}
