export class ValidationError extends Error {
    constructor(public readonly errors: FormError[]) {
        super('Validation error occured');
    }
}

export interface FormError {
    key: string;
    message: string;
}
