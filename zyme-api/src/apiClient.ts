import { ref, Ref } from '@vue/composition-api';
import { Form, FormModelBase } from 'zyme-forms';

import { ApiEndpoint } from './apiEndpoint';
import { injectApiInterceptor } from './apiInterceptor';
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
    submitForm<T extends FormModelBase, TResult>(
        form: Form<T>,
        endpoint: ApiEndpoint<T, TResult>
    ): Promise<TResult>;
    submitForm<T extends FormModelBase, TResult>(
        form: Form<any>,
        endpoint: ApiEndpoint<T, TResult>,
        request: T
    ): Promise<TResult>;
    submitForm<T extends FormModelBase, TResult>(
        form: Form<any>,
        endpoint: ApiEndpoint<T, TResult>,
        request?: T
    ): Promise<TResult> {
        return form.submit(() => {
            if (!request) {
                request = form.value as T | undefined;
            }

            if (!request) {
                throw new Error('No form model to be submitted!');
            }

            return this.call(endpoint, request);
        });
    }
}

export function useApiClient() {
    return new ApiClient();
}
