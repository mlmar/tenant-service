export type ApplicationErrorCode = 'account_disabled' | 'forbidden' | 'unsupported_image' | 'invalid_image';
export class ApplicationError extends Error {
    constructor(public readonly code: ApplicationErrorCode, message: string) { super(message); }
}
