// this is a dummy import just to make it an external module
// it's required to global scope to be working
import Vue from 'vue';

declare global {
    interface Constructor<T extends {} = any> {
        new (...args: any[]): T;
        prototype: T;
    }

    interface DefaultConstructor<T extends {} = any> {
        new (): T;
        prototype: T;
    }

    interface AbstractConstructor<T extends {} = any> {
        prototype: T;
        name: string;
    }

    interface Dictionary<T> {
        [id: string]: T;
        [id: number]: T;
    }

    type Defined<T> = T extends undefined ? never : T;
}
