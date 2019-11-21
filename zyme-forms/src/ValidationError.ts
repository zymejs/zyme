import { ModelError } from 'zyme-forms';

export class ValidationError extends Error {
    constructor(public errors: ModelError[]) {
        super('Validation error occured');
    }
}
