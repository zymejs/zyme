import { isRef, reactive, ref, watch, Ref } from '@vue/composition-api';
import axios, { CancelTokenSource } from 'axios';
import debounce from 'lodash-es/debounce';

import { unref } from '../core';
import { ApiEndpoint } from './apiEndpoint';
import { injectApiInterceptor } from './apiInterceptor';
import { callEndpoint } from './callEndpoint';

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

    /** Data will be loaded into this ref. Optional. */
    data?: Ref<TResult | null>;

    /** Loading flag will be updated into this ref. Optional. */
    loading?: Ref<boolean>;
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

    const dataRef = opts.data ?? ref<TResult>(null);
    const loadingRef = opts.loading ?? ref<boolean>(false);

    loadingRef.value = false;

    const dataSource = reactive({
        data: unref(dataRef),
        loading: unref(loadingRef),
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

    watch(opts.request, debouncedLoad, { deep: true });

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
        const cancel = axios.CancelToken.source();

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
