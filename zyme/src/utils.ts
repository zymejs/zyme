export function writable<T>(value: T): Writable<T> {
    return value as Writable<T>;
}

export function readonly<T>(value: T): Readonly<T> {
    return value;
}
