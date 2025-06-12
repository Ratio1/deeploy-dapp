import { Button } from '@heroui/button';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import ListHeader from '@shared/ListHeader';
import { Invoice } from '@typedefs/general';
import { RiEdit2Line, RiInfoCardLine } from 'react-icons/ri';
import InvoiceCard from './InvoiceCard';

const invoices: Invoice[] = [
    {
        id: '1',
        amount: 100,
        status: 'paid',
        date: '2025-05-01',
    },
    {
        id: '2',
        amount: 100,
        status: 'unpaid',
        date: '2025-06-01',
    },
];

const billingInfo = {
    companyName: 'Acme Corp',
    billingEmail: 'williamcornell@amce.co',
    vatNumber: 'IR4094507',
    paymentAddress: "34 Darley's Terrace, Saint Catherine's, Dublin, D08 X6C9, Ireland",
};

function Billing() {
    return (
        <div className="col w-full flex-1 gap-5">
            <CardWithHeader
                icon={<RiInfoCardLine />}
                title="Billing Information"
                label={
                    <Button className="h-[34px]" variant="faded" color="primary" size="sm">
                        <div className="row gap-1.5">
                            <RiEdit2Line className="text-base" />
                            <div className="text-sm">Update</div>
                        </div>
                    </Button>
                }
            >
                <div className="grid h-full w-full grid-cols-[16%_84%] gap-2.5">
                    <div className="text-sm text-slate-600">Company name</div>
                    <div className="text-sm font-medium">{billingInfo.companyName}</div>

                    <div className="text-sm text-slate-600">Billing email</div>
                    <div className="text-sm font-medium">{billingInfo.billingEmail}</div>

                    <div className="text-sm text-slate-600">VAT number</div>
                    <div className="text-sm font-medium">{billingInfo.vatNumber}</div>

                    <div className="text-sm text-slate-600">Payment address</div>
                    <div className="text-sm font-medium">{billingInfo.paymentAddress}</div>
                </div>
            </CardWithHeader>

            <div className="list">
                <ListHeader
                    // label={
                    //     <div className="row gap-2 lg:gap-2.5">
                    //         <div className="rounded-full bg-primary p-1.5 text-lg text-white">
                    //             <RiFileList2Line />
                    //         </div>
                    //         <div className="text-base font-semibold leading-6 text-body larger:text-lg">Invoices</div>
                    //     </div>
                    // }
                    label={<div className="text-lg font-semibold leading-6 text-body larger:text-[20px]">Invoices</div>}
                >
                    <div className="min-w-[150px]">Name</div>
                    <div className="min-w-[150px]">Amount</div>
                    <div className="min-w-[112px]">Status</div>
                    <div className="min-w-[112px]">Date</div>
                    <div className="min-w-[112px]">Action</div>
                </ListHeader>

                {invoices
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
