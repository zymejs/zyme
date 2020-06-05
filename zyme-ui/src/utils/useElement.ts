import { computed, getCurrentInstance } from '@vue/composition-api';

export function useElement() {
    const vm = getCurrentInstance();

    return computed(() => vm?.$el);
}
