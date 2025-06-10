export enum RegistrationStatus {
    NOT_REGISTERED = 'NOT_REGISTERED',
    NOT_CONFIRMED = 'NOT_CONFIRMED',
    REGISTERED = 'REGISTERED',
}

export enum KycStatus {
    Created = 'accCreated',
    Init = 'init',
    Pending = 'pending',
    Prechecked = 'prechecked',
    Queued = 'queued',
    Completed = 'completed',
    Approved = 'approved',
    OnHold = 'onHold',
    Rejected = 'rejected',
    FinalRejected = 'finalRejected',
}
