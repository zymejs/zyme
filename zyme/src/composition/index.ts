export * from './prop';
export * from './ioc';
export * from './router';

import { reactive as reactiveImport } from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

type Reactive<T> = {
    [P in keyof T]: UnwrapRef<T[P]>;
};

export function reactive<T extends {}>(obj: T): Reactive<T> {
    return (reactiveImport(obj) as unknown) as Reactive<T>;
}
