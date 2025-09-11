import { Skeleton } from '@heroui/skeleton';
import { getInvoiceDrafts } from '@lib/api/invoicing';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { InvoiceDraft } from '@typedefs/general';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { RiDraftLine, RiFileInfoLine, RiInfoCardLine } from 'react-icons/ri';
import BillingMonthSelect from './BillingMonthSelect';
import DraftInvoiceCard from './DraftInvoiceCard';

function Invoicing() {
    const [billingInfo, _setBillingInfo] = useState({
        companyName: '—',
        billingEmail: '—',
        vatNumber: '—',
        paymentAddress: '—',
    });

    const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
    const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[] | undefined>();

    const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Init
    useEffect(() => {
        (async () => {
            const drafts = await getInvoiceDrafts();

            const months: string[] = _(drafts)
                .orderBy('date', 'desc')
                .map((draft) => draft.creationTimestamp.slice(0, 7))
                .uniq()
                .value();

            const obj = {};

            drafts.forEach((draft) => {
                obj[draft.invoiceId] = false;
            });

            setExpanded(obj);

            setInvoiceDrafts(drafts);
            setUniqueMonths(months);
        })();
    }, []);

    return (
        <div className="col w-full flex-1 gap-5">
            <div className="w-full">
                <CardWithHeader icon={<RiInfoCardLine />} title="Billing Information">
                    <div className="grid h-full w-full grid-cols-2 gap-4">
                        <BillingInfoRow label="Company name" value={billingInfo.companyName} />
                        <BillingInfoRow label="Billing email" value={billingInfo.billingEmail} />
                        <BillingInfoRow label="VAT number" value={billingInfo.vatNumber} />
                        <BillingInfoRow label="Payment address" value={billingInfo.paymentAddress} />
                    </div>
                </CardWithHeader>
            </div>

            <BorderedCard isBorderDark>
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
                <div className="row w-full justify-between">
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
                        <div className="min-w-[62px]">Number</div>
                        <div className="min-w-[122px]">Date</div>
                        <div className="min-w-[170px]">Node Operator</div>
                        <div className="min-w-[118px]">Amount ($USDC)</div>
                        <div className="min-w-[92px]"></div>
                    </ListHeader>

                    {invoiceDrafts === undefined || selectedMonth === undefined ? (
                        <>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-[56px] w-full rounded-lg" />
                            ))}
                        </>
                    ) : !invoiceDrafts.length ? (
                        <div className="center-all w-full p-14">
                            <EmptyData
                                title="No invoice drafts founds"
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
                                    <div key={draft.invoiceId}>
                                        <DraftInvoiceCard
                                            draft={draft}
                                            isExpanded={expanded[draft.invoiceId]}
                                            toggle={() =>
                                                setExpanded({ ...expanded, [draft.invoiceId]: !expanded[draft.invoiceId] })
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

function BillingInfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="col gap-0.5">
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className="compact">{value}</div>
        </div>
    );
}
