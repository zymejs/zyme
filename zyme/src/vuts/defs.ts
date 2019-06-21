import Vue, { Component } from 'vue';

export type ComponentConstructor = new (...args: any[]) => Vue;

export interface ComponentOptions {
    name?: string;
    components?: { [id: string]: Component };
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
