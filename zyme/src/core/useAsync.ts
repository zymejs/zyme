import { ref, Ref } from '@vue/composition-api';

export function useAsync<T>(fcn: () => Promise<T>): Ref<T | null> {
    const reference = ref<T>(null);
    const promise = param instanceof Function ? param() : param;

    promise.then((result) => {
        reference.value = result;
    });

    return reference;
}
