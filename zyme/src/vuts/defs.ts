import Vue, { AsyncComponent, Component, ComponentOptions } from 'vue';

export type ComponentConstructor = new (...args: any[]) => Vue;

type VueComponent =
    | ComponentOptions<Vue>
    | typeof Vue
    | AsyncComponent
    | Component;

export interface ComponentOptions {
    name?: string;
    components?: { [id: string]: VueComponent };
}

export type LifecycleCallback = () => void;
export type LifecycleAsyncCallback = () => Promise<void>;

export type LifecycleHook =
    | 'beforeCreate'
    | 'created'
    | 'beforeMount'
    | 'mounted'
    | 'beforeUpdate'
    | 'updated'
    | 'activated'
    | 'deactivated'
    | 'errorCaptured'
    | 'beforeDestroy'
    | 'destroyed';
