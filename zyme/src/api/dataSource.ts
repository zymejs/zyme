import { Ref, watch, isRef, reactive } from '@vue/composition-api';
import axios, { CancelTokenSource } from 'axios';
import debounce from 'lodash-es/debounce';

import {} from '../composition';
import { ApiEndpoint } from './apiEndpoint';
import { callEndpoint } from './callEndpoint';
import { injectApiInterceptor } from './apiInterceptor';

export interface DataSourceOptions<T, TResult> {
    endpoint: ApiEndpoint<T, TResult>;
    /**
     * Request payload - it will be watched for changes to make calls.
     * Can be function or a reference.
     * If null is returned, API call will not be made.
     */
    request: (() => T | null) | Readonly<Ref<T | null>>;

    /** Number of milliseconds to debounce api calls */
    debounce?: number;
}

export interface DataSource<T> {
    readonly data: T | null;
    readonly loading: boolean;
    reload(): Promise<T | null>;
}

export function useDataSource<T, TResult>(opts: DataSourceOptions<T, TResult>) {
    const interceptor = injectApiInterceptor();
    const endpoint = opts.endpoint;

    let pendingCancel: CancelTokenSource | undefined;
    let pendingPromise: Promise<TResult> | undefined;

    const dataSource = reactive({
        data: null as TResult | null,
        loading: false,
        reload() {
            if (isRef(opts.request)) {
                return loadData(opts.request.value);
            } else {
                return loadData(opts.request());
            }
        }
    }) as Writable<DataSource<TResult>>;

    const debounceMs = opts.debounce || 200;
    const debouncedLoad = debounce(loadData, debounceMs, {
        leading: true,
        trailing: true
    });

    watch(opts.request, debouncedLoad);

    return dataSource as DataSource<TResult>;

    // function used to load the data
    async function loadData(request: T | null) {
        if (pendingCancel) {
            pendingCancel.cancel();
            pendingCancel = undefined;
            pendingPromise = undefined;
        }

        if (request == null) {
            return null;
        }

        let promise: Promise<TResult> | undefined;
        let cancel = axios.CancelToken.source();

        try {
            promise = callEndpoint({
                endpoint,
                request,
                interceptor,
                cancel: cancel.token
            });

            pendingPromise = promise;
            pendingCancel = cancel;

            dataSource.loading = true;

            const result = await promise;

            dataSource.data = result;

            return result;
        } finally {
            // we need to check if this is really the same request we started
            // because in the meantime some other request might start
            if (pendingPromise === promise) {
                pendingPromise = undefined;
                pendingCancel = undefined;

                dataSource.loading = false;
            }
        }
    }
}
