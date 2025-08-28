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

type TunnelingSecrets = {
    cloudflareAccountId: string;
    cloudflareApiKey: string;
    cloudflareZoneId: string;
    cloudflareDomain: string;
};

export type { AuthState, BillingInfo, Invoice, TunnelingSecrets };
