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

enum AuthState {
    SignedIn = 'signedIn',
    SignedOut = 'signedOut',
    NotConnected = 'notConnected',
}

export type { AuthState, BillingInfo, Invoice };
