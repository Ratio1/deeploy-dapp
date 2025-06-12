import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { SharedSelection } from '@heroui/system';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import ListHeader from '@shared/ListHeader';
import { Invoice } from '@typedefs/general';
import _ from 'lodash';
import { useState } from 'react';
import { RiCalendarEventLine, RiEdit2Line, RiInfoCardLine } from 'react-icons/ri';
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

const billingInfo = {
    companyName: 'Acme Corp',
    billingEmail: 'williamcornell@amce.co',
    vatNumber: 'IR4094507',
    paymentAddress: "34 Darley's Terrace, Saint Catherine's, Dublin, D08 X6C9, Ireland",
};

function Billing() {
    const uniqueMonths: string[] = _(invoices)
        .orderBy('date', 'desc')
        .map((i) => i.date.slice(0, 7))
        .uniq()
        .value();

    const [selectedMonth, setMonth] = useState(new Set<string>([uniqueMonths[0]]));

    return (
        <div className="col w-full flex-1 gap-5">
            <CardWithHeader
                icon={<RiInfoCardLine />}
                title="Billing Information"
                label={
                    <Button className="h-[34px] bg-slate-100" variant="faded" color="primary" size="sm">
                        <div className="row gap-1.5">
                            <RiEdit2Line className="text-base" />
                            <div className="text-sm">Update</div>
                        </div>
                    </Button>
                }
            >
                <div className="grid h-full w-full grid-cols-[15%_85%] gap-2.5">
                    <BillingInfoRow label="Company name" value={billingInfo.companyName} />
                    <BillingInfoRow label="Billing email" value={billingInfo.billingEmail} />
                    <BillingInfoRow label="VAT number" value={billingInfo.vatNumber} />
                    <BillingInfoRow label="Payment address" value={billingInfo.paymentAddress} />
                </div>
            </CardWithHeader>

            <div className="list">
                <ListHeader
                    label={
                        <div className="row w-full justify-between">
                            <div className="text-lg font-semibold leading-6 text-body larger:text-[20px]">Invoices</div>

                            <Select
                                className="max-w-48"
                                classNames={{
                                    trigger: 'min-h-10 bg-slate-200 data-[hover=true]:bg-[#e0e3f0] rounded-lg',
                                    label: 'group-data-[filled=true]:-translate-y-5',
                                    value: 'font-medium !text-slate-600',
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
                                startContent={<RiCalendarEventLine className="mt-[1px] text-[20px] text-slate-600" />}
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
                    // .filter((i) => selectedMonth.has(new Date(i.date).toLocaleString('en-US', { month: 'long' })))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((invoice) => (
                        <div key={invoice.id}>
                            <InvoiceCard invoice={invoice} />
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default Billing;

function BillingInfoRow({ label, value }: { label: string; value: string }) {
    return (
        <>
            <div className="text-sm text-slate-600">{label}</div>
            <div className="text-sm font-medium">{value}</div>
        </>
    );
}
