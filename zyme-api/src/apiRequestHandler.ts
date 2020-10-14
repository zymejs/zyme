import { RequestMethod, RequestQuery } from './types';

export interface ApiRequestParamsOptions<TRequest> {
    params?(request: TRequest): RequestQuery | null | undefined;
}

export interface ApiRequestDataOptions<TRequest> extends ApiRequestParamsOptions<TRequest> {
    data?(request: TRequest): any;
}

export interface ApiRequestFilesOptions<TRequest> extends ApiRequestParamsOptions<TRequest> {
    files(request: TRequest): FileList;
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

export function postFileUpload<TRequest = FileList>(
    options?: ApiRequestFilesOptions<TRequest>
): ApiRequestHandler<TRequest> {
    return {
        method: 'POST',
        params: request => {
            return options?.params ? options.params(request) : null;
        },
        data: request => {
            const files = options ? options.files(request) : ((request as unknown) as FileList);
            const formData = new FormData();
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                formData.append('files[]', file, file.name);
            }

            return formData;
        }
    };
}
