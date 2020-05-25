import { LogicError } from 'zyme';

export class ValidationError extends LogicError {
    constructor(public readonly errors: FormError[]) {
        super('Validation error occured');
    }
}

export interface FormError {
    readonly key: string;
    readonly message: string;
}
