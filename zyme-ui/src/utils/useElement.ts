import { computed, getCurrentInstance, Ref } from '@vue/composition-api';

export function useElement<T extends Element>(): Readonly<Ref<T | undefined>> {
    const vm = getCurrentInstance();

    return computed(() => vm?.proxy?.$el as T | undefined);
}
