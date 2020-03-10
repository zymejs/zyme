import { ref, Ref } from '@vue/composition-api';

import { injectApiInterceptor } from './apiInterceptor';
import { ApiEndpoint } from './apiEndpoint';
import { callEndpoint } from './callEndpoint';

class ApiClient {
    private readonly interceptor = injectApiInterceptor();

    call<TResult>(endpoint: ApiEndpoint<void, TResult>): Promise<TResult>;
    call<T, TResult>(endpoint: ApiEndpoint<T, TResult>, request: T): Promise<TResult>;
    call<T, TResult>(endpoint: ApiEndpoint<T, TResult>, request?: T): Promise<TResult> {
        return callEndpoint({
            endpoint,
            request: request as T,
            interceptor: this.interceptor
        });
    }

    load<TResult>(endpoint: ApiEndpoint<void, TResult>): Ref<TResult | null>;
    load<T, TResult>(endpoint: ApiEndpoint<T, TResult>, request: T): Ref<TResult | null>;
    load<T, TResult>(endpoint: ApiEndpoint<T, TResult>, request?: T): Ref<TResult | null> {
        const result = ref<TResult>(null);

        callEndpoint({
            endpoint,
            request: request as T,
            interceptor: this.interceptor
        }).then(r => {
            result.value = r;
        });

        return result;
    }
}

export function useApiClient() {
    return new ApiClient();
}
