import { Button } from '@heroui/button';
import { downloadCspDraft, downloadCspDraftJSON } from '@lib/api/backend';
import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithLabel from '@shared/ItemWithLabel';
import { InvoiceDraft } from '@typedefs/general';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DraftInvoiceCard({
    draft,
    isExpanded,
    toggle,
}: {
    draft: InvoiceDraft;
    isExpanded: boolean;
    toggle: () => void;
}) {
    const [isLoading, setLoading] = useState<boolean>(false);

    const downloadDraft = async (draftId: string) => {
        try {
            setLoading(true);
            const draft = await downloadCspDraft(draftId);
            console.log('Draft', draft);
        } catch (error) {
            console.error(error);
            toast.error('Failed to download draft.');
        } finally {
            setLoading(false);
        }
    };

    const downloadDraftJson = async (draftId: string) => {
        try {
            setLoading(true);
            const draft = await downloadCspDraftJSON(draftId);
            console.log('Draft JSON', draft);
        } catch (error) {
            console.error(error);
            toast.error('Failed to download draft.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BorderedCard isHoverable onClick={toggle}>
            <div className="col gap-4">
                {/* Content */}
                <div className="row justify-between gap-3 text-sm lg:gap-6">
                    <div className="min-w-[122px] font-medium">
                        {draft.invoiceNumber}/{draft.invoiceSeries}
                    </div>

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

                    <div className="flex min-w-[124px] justify-end gap-2">
                        <Button
                            className="border-2 border-slate-200 bg-white data-[hover=true]:!opacity-65"
                            isLoading={isLoading}
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => {
                                if (!isLoading) {
                                    console.log('Download', draft.draftId);
                                    downloadDraft(draft.draftId);
                                }
                            }}
                        >
                            <div className="text-sm">Download .doc</div>
                        </Button>

                        <Button
                            className="border-2 border-slate-200 bg-white data-[hover=true]:!opacity-65"
                            isLoading={isLoading}
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => {
                                if (!isLoading) {
                                    console.log('Download JSON', draft.draftId);
                                    downloadDraftJson(draft.draftId);
                                }
                            }}
                        >
                            <div className="text-sm">Download JSON</div>
                        </Button>
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
                                    <CopyableValue value={draft.draftId}>
                                        <div className="text-sm text-slate-400">{getShortAddressOrHash(draft.draftId, 8)}</div>
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
