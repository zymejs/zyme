export * from './prop';
export * from './router';

import { reactive as reactiveImport } from '@vue/composition-api';
import { UnwrapRef, Ref } from '@vue/composition-api/dist/reactivity';

type Reactive<T> = {
    [P in keyof T]: UnwrapRef<T[P]>;
};

export function reactive<T extends {}>(obj: T): T {
    return (reactiveImport(obj) as unknown) as T;
}

export function unref<T>(ref: Ref<T>) {
    return (ref as unknown) as T;
}
