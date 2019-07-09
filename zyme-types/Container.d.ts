import { Container, interfaces } from 'inversify';
import Vue from 'vue';

declare module 'vue/types/vue' {
    // tslint:disable-next-line:no-shadowed-variable
    interface Vue {
        readonly $container: Container;
    }
}

interface IocInjectOptions {
    identifier: interfaces.ServiceIdentifier<any>;
    optional?: boolean;
}

interface IocProvideOptions {
    identifier: interfaces.ServiceIdentifier<any>;
    resolve?: Constructor;
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        container?: Container;
        iocProvide?: { [prop: string]: IocProvideOptions };
        iocInject?: { [prop: string]: IocInjectOptions };
    }
}
