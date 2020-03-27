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
     * If undefined is returned, API call will not be made.
     */
    request: (() => T | undefined) | Readonly<Ref<T | undefined>>;

    /** Options for debouncing */
    debounce?: {
        /** Number of milliseconds to debounce api calls */
        time?: number;
        leading?: boolean;
        trailing?: boolean;
    };

    /** Data will be loaded into this ref. Optional. */
    data?: ((result: TResult) => void) | Ref<TResult | null>;

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

    const dataRef = isRef(opts.data) ? opts.data : ref<TResult>(null);
    const dataCallback = isRef(opts.data) ? null : opts.data;

    const loadingRef = opts.loading ?? ref<boolean>(false);

    loadingRef.value = false;

    const debounceTime = opts.debounce?.time ?? 300;
    const debouncedLoad = debounce(loadData, debounceTime, {
        leading: opts.debounce?.leading ?? true,
        trailing: opts.debounce?.trailing ?? true
    });

    const dataSource = reactive({
        data: unref(dataRef),
        loading: unref(loadingRef),
        reload() {
            return debouncedLoad.flush();
        }
    }) as Writable<DataSource<TResult>>;

    watch(opts.request, debouncedLoad, { deep: true });

    return dataSource as DataSource<TResult>;

    // function used to load the data
    async function loadData(request: T | undefined) {
        if (pendingCancel) {
            pendingCancel.cancel();
            pendingCancel = undefined;
            pendingPromise = undefined;
        }

        if (request === undefined) {
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
            if (dataCallback) {
                dataCallback(result);
            }

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
