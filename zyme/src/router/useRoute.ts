import { computed } from '@vue/composition-api';
import { requireCurrentInstance } from '../core';

export function useRoute() {
    const instance = requireCurrentInstance().proxy;

    return computed(() => instance.$route);
}
