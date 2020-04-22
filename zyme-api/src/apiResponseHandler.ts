import { AxiosResponse } from 'axios';

export type ApiResponseHandler<T> = (response: AxiosResponse) => T;

export function jsonResponse<T>(): ApiResponseHandler<T> {
    return response => response.data;
}
