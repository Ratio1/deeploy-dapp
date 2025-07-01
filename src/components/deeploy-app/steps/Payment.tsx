import { SlateCard } from '@shared/cards/SlateCard';

const SUMMARY_ITEMS = [
    {
        label: 'Application Type',
        value: 'Web App',
    },
    {
        label: 'Nodes',
        value: '12',
    },
    {
        label: 'GPU/CPU',
        value: 'CPU',
    },
    // {
    //     label: 'Configuration',
    //     value: 'ENTRY (1 core, 2 GB)',
    // },
    {
        label: 'Container Type',
        value: 'ENTRY',
    },
    {
        label: 'Configuration',
        value: '1 core, 2 GB',
    },
    {
        label: 'Expiration Date',
        value: new Date('2027-07-01').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    },
];

function Payment() {
    return (
        <div className="grid h-full w-full grid-cols-3 gap-3">
            {/*
                {item.label === 'Configuration' ? (
                    <div className="col text-center font-semibold">
                        <div className="text-base">{item.value.split(' ')[0]}</div>
                        <div className="text-base">{item.value.slice(item.value.split(' ')[0].length)}</div>
                    </div>
                )}
            */}

            {SUMMARY_ITEMS.map((item) => (
                <SlateCard key={item.label}>
                    <div className="col justify-center gap-1 py-2 text-center">
                        <div className="text-lg font-semibold">{item.value}</div>
                        <div className="text-sm font-medium text-slate-500">{item.label}</div>
                    </div>
                </SlateCard>
            ))}
        </div>
    );
}

export default Payment;
