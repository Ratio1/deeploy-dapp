import ListHeader from '@shared/ListHeader';
import { Invoice } from '@typedefs/general';
import { RiFileList2Line } from 'react-icons/ri';
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

function Billing() {
    return (
        <div className="col w-full flex-1 gap-5">
            <div className="list">
                <ListHeader
                    label={
                        <div className="row gap-1.5">
                            <RiFileList2Line className="text-lg text-body" />
                            <div className="text-lg font-semibold text-body">Invoices</div>
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
