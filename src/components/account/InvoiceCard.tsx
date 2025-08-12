import { BorderedCard } from '@shared/cards/BorderedCard';
import { SmallTag } from '@shared/SmallTag';
import { Invoice } from '@typedefs/general';
import { RiArrowRightLine } from 'react-icons/ri';

export default function InvoiceCard({ invoice }: { invoice: Invoice }) {
    return (
        <BorderedCard>
            <div className="row justify-between gap-3 text-sm lg:gap-6">
                <div className="min-w-[150px] font-medium">Invoice #00{invoice.id}</div>

                <div className="min-w-[150px]">${invoice.amount.toFixed(2)}</div>

                <div className="min-w-[112px]">
                    <SmallTag variant={invoice.status === 'paid' ? 'green' : 'default'}>
                        <div className="capitalize">{invoice.status}</div>
                    </SmallTag>
                </div>

                <div className="min-w-[112px]">
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </div>

                <div className="min-w-[112px]">
                    <div className="row cursor-pointer gap-1.5 hover:opacity-60">
                        <div className="compact">View invoice</div>
                        <RiArrowRightLine className="mt-px text-lg" />
                    </div>
                </div>
            </div>
        </BorderedCard>
    );
}
