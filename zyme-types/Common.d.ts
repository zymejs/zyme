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
}
