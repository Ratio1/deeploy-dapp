import { EthAddress } from './blockchain';

type InvoiceDraft = {
    invoiceId: string;
    creationTimestamp: string;
    userAddress: EthAddress;
    cspOwnerAddress: EthAddress;
    totalUsdcAmount: number;
    invoiceSeries: string;
    invoiceNumber: number;
    nodeOwnerName: string;
    cspOwnerName: string;
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

export type { AuthState, BillingInfo, InvoiceDraft, TunnelingSecrets };
