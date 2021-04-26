export function writable<T>(value: readonly T[]): T[];
export function writable<T>(value: Readonly<T>): T;
export function writable<T>(value: T): Writable<T>;
export function writable<T>(value: T | Readonly<T>): Writable<T> {
    return value as Writable<T>;
}

export function readonly<T>(value: T): Readonly<T> {
    return value;
}

export function immutable<T>(value: T): Immutable<T> {
    return value as Immutable<T>;
}
