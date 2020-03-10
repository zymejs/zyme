import { endpoint } from './apiEndpoint';
import { getRequest, postJsonRequest } from './apiRequestHandler';
import { jsonResponse } from './apiResponseHandler';

export const apiBuilder = {
    endpoint,
    getRequest,
    postJsonRequest,
    jsonResponse
};
