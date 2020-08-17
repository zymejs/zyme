import { inject as injectImport } from '@vue/composition-api';
import { computed, getCurrentInstance, isRef, Ref } from '@vue/composition-api';

export function unref<T>(ref: Ref<T>) {
    return (ref as unknown) as T;
}

export function requireCurrentInstance() {
    const vm = getCurrentInstance();
    if (!vm) {
        throw new Error('Must be called in setup() function');
    }

    return vm;
}

export function inject<T>(key: symbol | string): T;
export function inject<T>(key: symbol | string, defaultValue: T): T;
export function inject<T>(key: symbol | string, defaultValue?: T) {
    const value = injectImport(key, defaultValue);
    if (!value) {
        throw new Error(`No injection found for ${String(key)}`);
    }

    return value;
}

export function assert<T>(value: T | undefined | null): Exclude<T, undefined | null> {
    if (value == null) {
        throw new Error('No value given');
    }

    return value as Exclude<T, undefined | null>;
}
