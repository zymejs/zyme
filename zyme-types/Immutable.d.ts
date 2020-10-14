// this is a dummy import just to make it an external module
// it's required to global scope to be working
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Vue from 'vue';

type ImmutableObject<T extends Record<string, unknown>> = {
    readonly [P in keyof T]: Immutable<T[P]>;
};

interface ImmutableArrayLike<T> {
    readonly length: number;
    readonly [n: number]: Immutable<T>;
}

type ImmutableArray<T> = readonly Immutable<T>[];

declare global {
    type Immutable<T> = T extends string
        ? T // eslint-disable-next-line @typescript-eslint/ban-types
        : T extends Function
        ? T
        : T extends any[]
        ? ImmutableArray<ArrayItem<T>>
        : T extends ArrayLike<any>
        ? ImmutableArrayLike<ArrayItem<T>>
        : T extends Record<string, unknown>
        ? ImmutableObject<T>
        : T;
}
