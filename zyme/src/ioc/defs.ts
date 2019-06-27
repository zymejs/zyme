import { Container, interfaces } from 'inversify';
import Vue from 'vue';

export interface InjectConfig {
    identifier: interfaces.ServiceIdentifier<any>;
    optional?: boolean;
}

export interface ProvideConfig {
    identifier: interfaces.ServiceIdentifier<any>;
    resolve?: Constructor;
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        container?: Container;
        iocProvide?: { [prop: string]: ProvideConfig };
        iocInject?: { [prop: string]: InjectConfig };
    }
}
