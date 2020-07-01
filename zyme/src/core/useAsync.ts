import { ref, Ref } from '@vue/composition-api';

export function useAsync<T>(fcn: () => Promise<T>): Ref<T | null> {
    const reference: Ref<T | null> = ref(null);

    fcn().then((result) => {
        reference.value = result;
    });

    return reference;
}

export function refAsync<T>(promise: Promise<T>): Ref<T | undefined> {
    const reference = ref<T>();

    promise.then((result) => {
        reference.value = result;
    });

    return reference;
}
