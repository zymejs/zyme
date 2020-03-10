import axios, { AxiosRequestConfig } from 'axios';

import { ApiRequestHandler } from './apiRequestHandler';
import { ApiResponseHandler } from './apiResponseHandler';

export type ApiUrl<TRequest> = string | ((arg: TRequest) => string);

export interface ApiEndpoint<TRequest, TResult> {
    url: ApiUrl<TRequest>;
    request: ApiRequestHandler<TRequest>;
    response?: ApiResponseHandler<TResult>;
}

// purely for type inference
export function endpoint<TRequest = void, TResult = void>(config: ApiEndpoint<TRequest, TResult>) {
    return config;
}
