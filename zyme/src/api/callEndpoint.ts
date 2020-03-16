import axios, { AxiosRequestConfig, CancelToken, AxiosError } from 'axios';

import { ApiEndpoint, ApiUrl } from './apiEndpoint';
import { ApiInterceptor } from './apiInterceptor';

export interface ApiEndpointContext<TRequest, TResult> {
    endpoint: ApiEndpoint<TRequest, TResult>;
    interceptor: ApiInterceptor;
    request: TRequest;
    cancel?: CancelToken;
}

export async function callEndpoint<TRequest, TResult>(ctx: ApiEndpointContext<TRequest, TResult>) {
    const config: AxiosRequestConfig = {
        method: ctx.endpoint.request.method,
        url: resolveUrl(ctx.endpoint.url, ctx.request),
        cancelToken: ctx.cancel
    };

    // add query params
    const params = ctx.endpoint.request.params;
    if (params) {
        config.params = params(ctx.request);
    }

    // add body payload
    const data = ctx.endpoint.request.data;
    if (data) {
        config.data = data(ctx.request);
    }

    // run interceptors
    if (ctx.interceptor.request) {
        ctx.interceptor.request(config);
    }

    // run the request

    try {
        const response = await axios.request(config);

        // run response interceptors
        if (ctx.interceptor.response) {
            ctx.interceptor.response(response);
        }

        // handle the response
        if (ctx.endpoint.response) {
            return ctx.endpoint.response(response);
        }
    } catch (e) {
        const axiosError = e as AxiosError;

        // run response interceptors
        if (axiosError.isAxiosError && axiosError.response && ctx.interceptor.response) {
            ctx.interceptor.response(axiosError.response);
        }

        throw e;
    }

    return (undefined as unknown) as TResult;
}

function resolveUrl<T>(url: ApiUrl<T>, request: T): string {
    if (typeof url === 'string') {
        return url;
    }

    return url(request);
}
