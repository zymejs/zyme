import { Injectable } from 'zyme';

export interface QueryPrimitive {
    toString(): string;
}

export interface HttpRequestQuery {
    [key: string]: QueryPrimitive | undefined;
}

export interface HttpRequest {
    url: string;
    query?: HttpRequestQuery;
}

export interface HttpPostRequest extends HttpRequest {}

export interface HttpPostJsonRequest<T> extends HttpPostRequest {
    body: T;
}

export interface HttpResponse extends Response {
    json<T>(): Promise<T>;
}

export class HttpError extends Error {
    constructor(public readonly response: HttpResponse) {
        super(response.statusText);
    }
}

@Injectable()
export class HttpClient {
    public async get(request: HttpRequest): Promise<HttpResponse> {
        let url = this.getUrlWithQuery(request);

        let response = await fetch(url, {
            method: 'GET'
        });

        return this.handleResponse ? this.handleResponse(response) : response;
    }

    public async postJson<T>(request: HttpPostJsonRequest<T>): Promise<HttpResponse> {
        let url = this.getUrlWithQuery(request);

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request.body)
        });

        return this.handleResponse ? this.handleResponse(response) : response;
    }

    protected getUrl?(request: HttpRequest): string;

    protected getQueryParams?(request: HttpRequest): HttpRequestQuery | undefined;

    protected handleResponse?(response: HttpResponse): HttpResponse | Promise<HttpResponse>;

    private getUrlWithQuery(request: HttpRequest): string {
        const url = this.getUrl ? this.getUrl(request) : request.url;
        const queryString = this.getQueryString(request);

        return queryString ? url + queryString : url;
    }

    private getQueryString(request: HttpRequest): string | void {
        const params = this.getQueryParams ? this.getQueryParams(request) : request.query;
        if (!params) {
            return undefined;
        }

        let keys = Object.keys(params);

        if (!keys.length) {
            return undefined;
        }

        let queryParams = keys
            .map(k => this.getQueryParam(k, params[k]))
            .filter(x => x !== undefined)
            .join('&');

        return '?' + queryParams;
    }

    private getQueryParam(key: string, value: QueryPrimitive | undefined) {
        if (value === undefined) {
            return undefined;
        }

        return `${encodeURIComponent(key)}=${value.toString()}`;
    }
}
