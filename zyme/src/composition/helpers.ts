import { reactive as reactiveImport, toRefs as toRefsImport } from '@vue/composition-api';
import { isRef, computed, Ref, getCurrentInstance } from '@vue/composition-api';

export function reactive<T extends {}>(obj: T): T {
    return (reactiveImport(obj) as unknown) as T;
}

export function unref<T>(ref: Ref<T>) {
    return (ref as unknown) as T;
}

export function toRefs<T extends {}>(obj: T) {
    return toRefsImport(obj);
}

export function propRef<T, K extends keyof T>(obj: T | Ref<T>, key: K): Ref<T[K]> {
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
