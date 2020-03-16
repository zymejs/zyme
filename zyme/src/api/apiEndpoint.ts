import { ApiRequestHandler } from './apiRequestHandler';
import { ApiResponseHandler } from './apiResponseHandler';

export type ApiUrl<TRequest> = string | ((arg: TRequest) => string);

export interface ApiEndpoint<TRequest, TResult> {
    url: ApiUrl<TRequest>;
    request: ApiRequestHandler<TRequest>;
    response?: ApiResponseHandler<TResult>;
}
