import { computed, getCurrentInstance } from '@vue/composition-api';

export function useRoute() {
    const instance = getCurrentInstance();

    return computed(() => instance?.$route);
}
