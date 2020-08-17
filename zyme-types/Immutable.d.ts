// this is a dummy import just to make it an external module
// it's required to global scope to be working
import Vue from 'vue';

type ImmutableObject<T extends {}> = { readonly [P in keyof T]: Immutable<T[P]> };

interface ImmutableArrayLike<T> {
    readonly length: number;
    readonly [n: number]: Immutable<T>;
}

type ImmutableArray<T> = readonly Immutable<T>[];

declare global {
    type Immutable<T> = T extends string
        ? T // tslint:disable-next-line: ban-types
        : T extends Function
        ? T
        : T extends any[]
        ? ImmutableArray<ArrayItem<T>>
        : T extends ArrayLike<any>
        ? ImmutableArrayLike<ArrayItem<T>>
        : T extends object
        ? ImmutableObject<T>
        : T;
}
