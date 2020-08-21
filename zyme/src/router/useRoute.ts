import { computed } from '@vue/composition-api';
import { requireCurrentInstance } from '../core';

export function useRoute() {
    const instance = requireCurrentInstance();

    return computed(() => instance.$route);
}
