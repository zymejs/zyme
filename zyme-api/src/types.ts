import { Method } from 'axios';

export interface RequestQueryPrimitive {
    toString(): string;
}

export interface RequestQuery {
    [key: string]: RequestQueryPrimitive | undefined | null;
}

export interface RequestHeaders {
    [name: string]: string;
}

export type RequestMethod = Method;
