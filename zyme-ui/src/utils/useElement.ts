import { computed, getCurrentInstance, Ref } from '@vue/composition-api';

export function useElement<T extends Element>(): Readonly<Ref<T | undefined>> {
    const vm = getCurrentInstance()?.proxy;

    return {
        get value() {
            return vm?.$el as T | undefined;
        },
    } as Readonly<Ref<T | undefined>>;
}
