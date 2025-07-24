import { Select, SelectItem } from '@heroui/select';
import { SharedSelection } from '@heroui/system';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import ListHeader from '@shared/ListHeader';
import { Invoice } from '@typedefs/general';
import _ from 'lodash';
import { useState } from 'react';
import { RiCalendarEventLine, RiInfoCardLine } from 'react-icons/ri';
import InvoiceCard from './InvoiceCard';

const invoices: Invoice[] = [
    {
        id: '1',
        amount: 200,
        status: 'paid',
        date: '2024-12-01',
    },
    {
        id: '2',
        amount: 100,
        status: 'paid',
        date: '2025-04-01',
    },
    {
        id: '3',
        amount: 100,
        status: 'paid',
        date: '2025-05-01',
    },
    {
        id: '4',
        amount: 100,
        status: 'paid',
        date: '2025-06-01',
    },
    {
        id: '5',
        amount: 50,
        status: 'unpaid',
        date: '2025-06-10',
    },
];

function Billing() {
    const [billingInfo, setBillingInfo] = useState({
        companyName: 'Acme Corp',
        billingEmail: 'william.cornell@acme.com',
        vatNumber: 'IR4094507',
        paymentAddress: "34 Darley's Terrace, Saint Catherine's",
        country: 'Ireland',
        city: 'Dublin',
    });

    const uniqueMonths: string[] = _(invoices)
        .orderBy('date', 'desc')
        .map((i) => i.date.slice(0, 7))
        .uniq()
        .value();

    const [selectedMonth, setMonth] = useState(new Set<string>([uniqueMonths[0]]));

    return (
        <>
            <div className="col w-full flex-1 gap-5">
                <CardWithHeader icon={<RiInfoCardLine />} title="Billing Information">
                    <div className="grid h-full w-full grid-cols-2 gap-3">
                        <BillingInfoRow label="Company name" value={billingInfo.companyName} />
                        <BillingInfoRow label="Billing email" value={billingInfo.billingEmail} />
                        <BillingInfoRow label="VAT number" value={billingInfo.vatNumber} />
                        <BillingInfoRow
                            label="Payment address"
                            value={`${billingInfo.paymentAddress}, ${billingInfo.city}, ${billingInfo.country}`}
                        />
                    </div>
                </CardWithHeader>

                <div className="list">
                    <ListHeader
                        label={
                            <div className="row w-full justify-between">
                                <div className="text-body larger:text-[20px] text-lg leading-6 font-semibold">Invoices</div>

                                <Select
                                    className="max-w-48"
                                    classNames={{
                                        trigger: 'min-h-10 bg-slate-200 data-[hover=true]:bg-[#e0e3f0] rounded-lg shadow-none',
                                        label: 'group-data-[filled=true]:-translate-y-5',
                                        value: 'font-medium text-slate-600!',
                                        selectorIcon: 'mt-0.5 mr-0.5',
                                    }}
                                    listboxProps={{
                                        itemClasses: {
                                            base: [
                                                'rounded-[10px]',
                                                'text-default-500',
                                                'transition-opacity',
                                                'data-[hover=true]:text-foreground',
                                                'data-[hover=true]:bg-default-100',
                                                'data-[selectable=true]:focus:bg-default-100',
                                                'data-[pressed=true]:opacity-70',
                                                'data-[focus-visible=true]:ring-default-500',
                                                'px-3 py-2',
                                            ],
                                        },
                                    }}
                                    popoverProps={{
                                        classNames: {
                                            base: 'before:bg-default-200',
                                            content: 'p-0 border-small border-divider bg-background',
                                        },
                                    }}
                                    placeholder="Select a month"
                                    variant="flat"
                                    startContent={<RiCalendarEventLine className="mt-px text-[20px] text-slate-600" />}
                                    selectedKeys={selectedMonth}
                                    onSelectionChange={(value: SharedSelection) => {
                                        if (value.anchorKey) {
                                            setMonth(new Set<string>([value.anchorKey]));
                                        }
                                    }}
                                >
                                    {uniqueMonths.map((monthAndYear) => (
                                        <SelectItem key={monthAndYear}>
                                            {new Date(monthAndYear).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        }
                    >
                        <div className="min-w-[150px]">Name</div>
                        <div className="min-w-[150px]">Amount</div>
                        <div className="min-w-[112px]">Status</div>
                        <div className="min-w-[112px]">Date</div>
                        <div className="min-w-[112px]"></div>
                    </ListHeader>

                    {invoices
                        .filter((i) => selectedMonth.has(i.date.slice(0, 7)))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((invoice) => (
                            <div key={invoice.id}>
                                <InvoiceCard invoice={invoice} />
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}

export default Billing;

function BillingInfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="col gap-0.5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="compact">{value}</div>
        </div>
    );
}
