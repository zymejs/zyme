export abstract class LogicError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
