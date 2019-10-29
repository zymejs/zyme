// this is a dummy import just to make it an external module
// it's required to global scope to be working
import Vue from 'vue';

declare global {
    interface Constructor<T = any, TArgs extends any[] = any[]> {
        new (...args: TArgs): T;
        prototype: T;
    }

    interface DefaultConstructor<T = any> {
        new (): T;
        prototype: T;
    }

    interface AbstractConstructor<T = any> {
        prototype: T;
        name: string;
    }

    interface Dictionary<T> {
        [id: string]: T;
        [id: number]: T;
    }

    type Defined<T> = T extends undefined ? never : T;

    type Writable<T> = { -readonly [P in keyof T]-?: T[P] };

    type PromiseResult<T> = T extends Promise<infer X> ? X : never;

    type FunctionResult<T> = T extends ((...args: any[]) => infer X) ? X : never;

    type AsyncFunctionResult<T> = PromiseResult<FunctionResult<T>>;

    type InstanceOf<T> = T extends Constructor<infer X> ? X : never;

    type OptionalKeysMap<A, B> = { [K in keyof A & keyof B]: A[K] extends B[K] ? never : K };
    type OptionalKeys<T> = OptionalKeysMap<T, Required<T>>[keyof T];

    type RequiredKeysMap<A, B> = { [K in keyof A & keyof B]: A[K] extends B[K] ? K : never };
    type RequiredKeys<T> = RequiredKeysMap<T, Required<T>>[keyof T];

    type AllKeys<T> = OptionalKeys<T> | RequiredKeys<T>;
}
