type Invoice = {
    id: string;
    amount: number;
    status: 'paid' | 'unpaid';
    date: string;
};

type BillingInfo = {
    companyName: string;
    billingEmail: string;
    vatNumber: string;
    paymentAddress: string;
    country: string;
    city: string;
};

export type { BillingInfo, Invoice };
