import { inject, provide } from '@vue/composition-api';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

const apiInterceptorSymbol = Symbol('apiInterceptor');

let globalInterceptor: ApiInterceptor | undefined;

export interface ApiInterceptor {
    request?(request: AxiosRequestConfig): void;
    response?(response: AxiosResponse): void;
}

export function injectApiInterceptor() {
    const interceptor = inject<ApiInterceptor>(apiInterceptorSymbol, {});
    return combineInterceptors(globalInterceptor, interceptor);
}

export function provideApiInterceptor(interceptor: ApiInterceptor) {
    const current = injectApiInterceptor();
    const next = combineInterceptors(current, interceptor);

    provide(apiInterceptorSymbol, next);
}

/**
 * Adds global API interceptor.
 * Use only during app initialization
 */
export function provideGlobalApiInterceptor(interceptor: ApiInterceptor) {
    globalInterceptor = combineInterceptors(globalInterceptor, interceptor);
}

function combineInterceptors(first?: ApiInterceptor, second?: ApiInterceptor): ApiInterceptor {
    if (!first) {
        return second ?? {};
    }

    if (!second) {
        return first;
    }

    return {
        request: combineHandlers(first.request, second.request),
        response: combineHandlers(first.response, second.response)
    };
}

function combineHandlers<T>(first?: (x: T) => void, second?: (x: T) => void) {
    if (!first) {
        return second;
    }

    if (!second) {
        return first;
    }

    return function(x: T) {
        first(x);
        second(x);
    };
}
