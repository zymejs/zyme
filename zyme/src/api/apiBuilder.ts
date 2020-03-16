import { ApiEndpoint } from './apiEndpoint';
import { getRequest, postJsonRequest } from './apiRequestHandler';
import { jsonResponse } from './apiResponseHandler';

export const apiBuilder = {
    // purely for type inference
    endpoint<TRequest = void, TResult = void>(config: ApiEndpoint<TRequest, TResult>) {
        return config;
    },
    getRequest,
    postJsonRequest,
    jsonResponse
};
