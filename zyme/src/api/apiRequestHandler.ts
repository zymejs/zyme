import { RequestQuery, RequestMethod } from './types';

export interface ApiRequestParamsOptions<TRequest> {
    params?(request: TRequest): RequestQuery | null | undefined;
}

export interface ApiRequestDataOptions<TRequest> extends ApiRequestParamsOptions<TRequest> {
    data?(request: TRequest): any;
}

export interface ApiRequestHandler<TRequest> {
    readonly method: RequestMethod;
    params?(request: TRequest): RequestQuery | null | undefined;
    data?(request: TRequest): any;
}

export function getRequest<TRequest = void>(
    options?: ApiRequestParamsOptions<TRequest>
): ApiRequestHandler<TRequest> {
    return {
        method: 'GET',
        // if no options provided, send request as query params
        params: options != null ? options.params : t => t as any
    };
}

export function postJsonRequest<TRequest = void>(
    options?: ApiRequestDataOptions<TRequest>
): ApiRequestHandler<TRequest> {
    return {
        method: 'POST',
        params: options?.params,
        // if no options provided, send request as data
        data: options != null ? options.data : t => t
    };
}
