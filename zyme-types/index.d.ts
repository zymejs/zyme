import { Container, interfaces } from 'inversify';
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
}

export interface IocInjectOptions {
    identifier: interfaces.ServiceIdentifier<any>;
    optional?: boolean;
}

export interface IocProvideOptions {
    identifier: interfaces.ServiceIdentifier<any>;
    resolve?: Constructor;
}

declare module 'vue/types/vue' {
    // tslint:disable-next-line:no-shadowed-variable
    interface Vue {
        readonly $container: Container;
        $scrollTo(element: Vue): void;
    }
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        container?: Container;
        iocProvide?: { [prop: string]: IocProvideOptions };
        iocInject?: { [prop: string]: IocInjectOptions };
    }
}
