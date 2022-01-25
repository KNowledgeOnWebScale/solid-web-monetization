export interface SubscriptionDetails {
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

export interface SessionDetails {
    id: string;
    target: string;
    totalAmountTransferred: number;
    assetCode: string;
    assetScale: number;
}