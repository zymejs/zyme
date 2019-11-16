import Vue, {
    AsyncComponent,
    Component,
    ComponentOptions as VueComponentOptions,
    FunctionalComponentOptions
} from 'vue';

export type ComponentConstructor = new (...args: any[]) => Vue;

type VueComponent =
    | VueComponentOptions<Vue>
    | typeof Vue
    | AsyncComponent
    | Component
    | FunctionalComponentOptions<any>;

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
