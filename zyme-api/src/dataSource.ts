import { computed, isRef, reactive, ref, watch, Ref } from '@vue/composition-api';
import axios, { CancelTokenSource } from 'axios';
import debounce from 'lodash/debounce';
import { unref } from 'zyme';

import { ApiEndpoint } from './apiEndpoint';
import { injectApiInterceptor } from './apiInterceptor';
import { callEndpoint } from './callEndpoint';

export interface DataSourceOptions<T, TResult> {
    readonly endpoint: ApiEndpoint<T, TResult>;
    /**
     * Request payload - it will be watched for changes to make calls.
     * Can be function or a reference.
     * If undefined is returned, API call will not be made.
     */
    readonly request: (() => T | undefined) | Readonly<Ref<T | undefined>>;

    /** Options for debouncing */
    readonly debounce?: {
        /** Number of milliseconds to debounce api calls */
        time?: number;
        leading?: boolean;
        trailing?: boolean;
    };

    /** Data will be loaded into this ref. Optional. */
    readonly data?: ((result: TResult) => void) | Ref<TResult | null>;

    /** Loading flag will be updated into this ref. Optional. */
    readonly loading?: Ref<boolean>;
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
    const requestRef = isRef(opts.request) ? opts.request : computed(opts.request);

    const loadingRef = opts.loading ?? ref<boolean>(false);

    loadingRef.value = false;

    const debounceTime = opts.debounce?.time ?? 300;
    const debouncedLoad = debounce(loadData, debounceTime, {
        leading: opts.debounce?.leading ?? true,
        trailing: opts.debounce?.trailing ?? true
    });

    watch(requestRef, debouncedLoad, { deep: true });

    return reactive({
        data: unref(dataRef),
        loading: unref(loadingRef),
        reload() {
            debouncedLoad();
            return debouncedLoad.flush();
        }
    }) as DataSource<TResult>;

    // function used to load the data
    async function loadData() {
        if (pendingCancel) {
            pendingCancel.cancel();
            pendingCancel = undefined;
            pendingPromise = undefined;
        }

        const request = requestRef.value;
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

            loadingRef.value = true;

            const result = await promise;

            dataRef.value = result;
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

                loadingRef.value = false;
            }
        }
    }
}
