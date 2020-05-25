import { LogicError } from './LogicError';

export class CancelError extends LogicError {
    constructor() {
        super('Operation was cancelled');
    }
}
