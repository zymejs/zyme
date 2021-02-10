import { computed, isRef, ref, Ref } from '@vue/composition-api';

export type RefParam<T> = Readonly<Ref<T>> | ((this: void) => T);

export function toRef<T, K extends keyof T>(obj: RefParam<T>, key: K): Ref<T[K]>;
export function toRef<T, K extends keyof T>(obj: T, key: K): Ref<T[K]>;
export function toRef<T>(param: RefParam<T>): Readonly<Ref<T>>;
export function toRef<T>(param: T): Readonly<Ref<T>>;
export function toRef<T, K extends keyof T>(
    param: RefParam<T> | T,
    key?: K
): Readonly<Ref<T>> | Ref<T[K]> {
    const wrapped = wrapWithRef(param);

    if (key == null) {
        return wrapped;
    }

    return computed({
        get: () => wrapped.value[key],
        set: (v) => (wrapped.value[key] = v),
    });
}

function wrapWithRef<T>(param: RefParam<T> | T) {
    if (isRef(param)) {
        return param;
    }

    if (param instanceof Function || typeof param === 'function') {
        return computed(param as (this: void) => T);
    }

    return ref(param) as Readonly<Ref<T>>;
}
