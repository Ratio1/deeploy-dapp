import { Skeleton } from '@heroui/skeleton';
import { getInvoiceDrafts } from '@lib/api/backend';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { DetailedAlert } from '@shared/DetailedAlert';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { InvoiceDraft } from '@typedefs/general';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCloseCircleLine, RiDraftLine, RiFileInfoLine } from 'react-icons/ri';
import BillingMonthSelect from './BillingMonthSelect';
import DraftInvoiceCard from './DraftInvoiceCard';

function Invoicing() {
    const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
    const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[] | undefined>();

    const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Init
    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        setLoading(true);
        setError(null);

        try {
            const drafts = await getInvoiceDrafts();
            // console.log('Drafts', drafts);

            if (drafts === undefined) {
                throw new Error('No invoice drafts available.');
            }

            const months: string[] = _(drafts)
                .map((draft) => draft.creationTimestamp.slice(0, 7))
                .uniq()
                .value()
                .sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

            const obj = {};

            drafts.forEach((draft) => {
                obj[draft.draftId] = false;
            });

            setExpanded(obj);
            setInvoiceDrafts(drafts);
            setUniqueMonths(months);
        } catch (error: any) {
            console.error(error);
            const errorMessage = 'Failed to fetch invoice drafts';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="col w-full flex-1 gap-5">
            <BorderedCard>
                <div className="flex gap-2">
                    <div className="flex">
                        <RiFileInfoLine className="text-primary text-xl" />
                    </div>

                    <div className="compact">
                        The Node Operator is responsible for issuing a final invoice based on the draft and sending it to you
                        via email. If you do not receive the invoice within 48 hours, you may download the draft yourself.
                    </div>
                </div>
            </BorderedCard>

            <div className="col gap-3">
                <div className="row min-h-10 w-full justify-between">
                    <div className="text-body text-xl leading-6 font-semibold">Invoice Drafts</div>

                    <BillingMonthSelect
                        uniqueMonths={uniqueMonths}
                        onMonthChange={(month) => {
                            setSelectedMonth(month);
                        }}
                    />
                </div>

                <div className="list">
                    <ListHeader>
                        <div className="min-w-[122px]">Number</div>
                        <div className="min-w-[122px]">Date</div>
                        <div className="min-w-[170px]">Node Operator</div>
                        <div className="min-w-[118px]">Amount ($USDC)</div>
                        <div className="min-w-[124px]"></div>
                    </ListHeader>

                    {isLoading ? (
                        <>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-[56px] w-full rounded-lg" />
                            ))}
                        </>
                    ) : error !== null ? (
                        <div className="py-8 lg:py-12">
                            <DetailedAlert
                                variant="red"
                                icon={<RiCloseCircleLine />}
                                title="Error"
                                description={<div>{error}</div>}
                                isCompact
                            />
                        </div>
                    ) : invoiceDrafts === undefined || selectedMonth === undefined || !invoiceDrafts.length ? (
                        <div className="center-all w-full p-14">
                            <EmptyData
                                title="No invoice drafts available"
                                description="Your drafts will be displayed here"
                                icon={<RiDraftLine />}
                            />
                        </div>
                    ) : (
                        <>
                            {invoiceDrafts
                                .filter((draft) => draft.creationTimestamp.startsWith(selectedMonth))
                                .sort(
                                    (a, b) => new Date(b.creationTimestamp).getTime() - new Date(a.creationTimestamp).getTime(),
                                )
                                .map((draft) => (
                                    <div key={draft.draftId}>
                                        <DraftInvoiceCard
                                            draft={draft}
                                            isExpanded={expanded[draft.draftId]}
                                            toggle={() =>
                                                setExpanded({ ...expanded, [draft.draftId]: !expanded[draft.draftId] })
                                            }
                                        />
                                    </div>
                                ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Invoicing;
