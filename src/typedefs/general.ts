import { EthAddress } from './blockchain';

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

type InvoiceDraft = {
    draftId: string;
    creationTimestamp: string;
    userAddress: EthAddress;
    cspOwnerAddress: EthAddress;
    totalUsdcAmount: number;
    invoiceSeries: string;
    invoiceNumber: number;
    nodeOwnerName: string;
    cspOwnerName: string;
};

type PublicProfileInfo = {
    name: string;
    description: string;
    links: Record<string, string>;
};

export type { AuthState, BillingInfo, InvoiceDraft, PublicProfileInfo, TunnelingSecrets };
