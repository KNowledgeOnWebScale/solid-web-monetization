export interface SubscriptionDetails {
    '@context': string;
    '@id': string;
    '@type': string;
    userId: string;
    paymentPointer: string;
    mandateURI: string;
    valid: boolean;
}

export interface Mandate {
    id: string;
    account: string;
    amount: number;
    assetCode: string;
    assetScale: number;
    interval: string;
    startAt: Date;
    expiresAt: Date | null;
    balance: number;
}

export interface SessionGraph {
    '@context': string;
    '@graph': SessionDetails[];
}

export interface SessionDetails {
    '@id': string;
    '@type': string;
    target: string;
    totalAmountTransferred: number;
    assetCode: string;
    assetScale: number;
    active: true;

}