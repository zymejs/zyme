import { ref, Ref } from '@vue/composition-api';

export function useAsync<T>(fcn: () => Promise<T>): Ref<T | null> {
    const reference = ref<T>(null);

    fcn().then(result => {
        reference.value = result;
    });

    return reference;
}
