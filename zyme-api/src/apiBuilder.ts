import { ApiEndpoint } from './apiEndpoint';
import * as requests from './apiRequestHandler';
import * as responses from './apiResponseHandler';

export const apiBuilder = {
    // purely for type inference
    endpoint<TRequest = void, TResult = void>(config: ApiEndpoint<TRequest, TResult>) {
        return config;
    },
    ...requests,
    ...responses
};
