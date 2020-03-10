import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { provide, inject } from '@vue/composition-api';

const apiInterceptorSymbol = Symbol('apiInterceptor');

export interface ApiInterceptor {
    request?(request: AxiosRequestConfig): void;
    response?(response: AxiosResponse): void;
}

export function injectApiInterceptor() {
    return inject<ApiInterceptor>(apiInterceptorSymbol, {});
}

export function useApiInterceptor(config: ApiInterceptor) {
    const current = injectApiInterceptor();

    const next: ApiInterceptor = {
        request: combine(current.request, config.request),
        response: combine(current.response, config.response)
    };

    provide(apiInterceptorSymbol, next);
}

function combine<T>(first?: (x: T) => void, second?: (x: T) => void) {
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
