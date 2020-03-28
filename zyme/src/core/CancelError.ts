export class CancelError extends Error {
    constructor() {
        super('Operation was cancelled');
    }
}
