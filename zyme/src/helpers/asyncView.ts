import Vue from 'vue';

export interface AsyncModule<T> {
    default: T;
}

export function asyncView<T extends typeof Vue>(loader: () => Promise<AsyncModule<T>>) {
    return () => loader().then(v => v.default);
}
