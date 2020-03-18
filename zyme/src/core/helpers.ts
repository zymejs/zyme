import { inject as injectImport } from '@vue/composition-api';
import { computed, getCurrentInstance, isRef, Ref } from '@vue/composition-api';

export function unref<T>(ref: Ref<T>) {
    return (ref as unknown) as T;
}

export function toRef<T, K extends keyof T>(obj: T | Ref<T>, key: K): Ref<T[K]> {
    if (isRef(obj)) {
        return computed({
            get: () => obj.value[key],
            set: v => (obj.value[key] = v)
        }) as Ref<T[K]>;
    }

    return computed({
        get: () => obj[key],
        set: v => (obj[key] = v)
    }) as Ref<T[K]>;
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
