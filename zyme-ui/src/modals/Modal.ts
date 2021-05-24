import { ref, onUnmounted } from '@vue/composition-api';
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue, { ComponentOptions } from 'vue';
import { getCurrentInstance } from '@vue/composition-api';
import { prop, CancelError, PropTypes } from 'zyme';

import { disableBodyScroll, enableBodyScroll, useVirtualHistory } from '../utils';

type ModalHandlerProps<TResult> = {
    modal: ModalHandler<TResult>;
};

type ModalHandlePropsDef = FunctionResult<typeof useModalProps>;

type ModalComponentOptions<TResult, TProps extends ModalHandlePropsDef> = ComponentOptions<
    Vue,
    any,
    any,
    any,
    TProps,
    ModalHandlerProps<TResult>
>;

type ModalComponentView<T extends ModalComponentOptions<any, any>> =
    | T
    | (() => Promise<{ default: T }>)
    | Promise<{ default: T }>;

type ModalPropsBase<T> = T extends ModalComponentOptions<any, infer TProps>
    ? PropTypes<TProps>
    : never;
type ModalPropsWithoutHandler<T> = Omit<ModalPropsBase<T>, 'modal'>;

type ModalProps<T> = keyof ModalPropsWithoutHandler<T> extends never
    ? void
    : ModalPropsWithoutHandler<T>;

type ModalResult<T> = T extends ModalComponentOptions<infer TResult, any> ? TResult : never;

export interface ModalHandler<T> {
    done(result: T): void;
    cancel(): void;
}

const allModals: ModalHandler<unknown>[] = [];

export function useModalProps<T = void>() {
    return {
        modal: prop<ModalHandler<T>>().required(),
    };
}

export type OpenModalOptions<T extends ModalComponentOptions<any, any>> = ModalProps<T> extends void
    ? OpenModalOptionsWithoutProps<T>
    : OpenModalOptionsWithProps<T>;

interface OpenModalOptionsWithoutProps<T> {
    modal: ModalComponentView<T>;
}

interface OpenModalOptionsWithProps<T> {
    modal: ModalComponentView<T>;
    props: ModalProps<T>;
}

interface ModalOptions {
    /**
     * Close all open modals when component is unmounted.
     * By default true
     */
    closeOnUnmounted?: boolean;
}

export function useModal(opts?: ModalOptions) {
    const currentInstance = getCurrentInstance()?.proxy;
    const virtualHistory = useVirtualHistory();

    const localModals: ModalHandler<unknown>[] = [];

    const closeOnUnmounted = opts?.closeOnUnmounted ?? true;

    if (closeOnUnmounted) {
        onUnmounted(() => localModals.forEach((m) => m.cancel()));
    }

    return {
        open<T extends ModalComponentOptions<any, any>>(options: OpenModalOptions<T>) {
            const view = unwrapModalComponent(options.modal);
            const props = (options as OpenModalOptionsWithProps<T>).props;

            const promise = new Promise<ModalResult<T>>((resolve, reject) => {
                const open = ref(true);

                const handler: ModalHandler<ModalResult<T>> = {
                    done(result) {
                        if (!open.value) {
                            return;
                        }

                        void closeModal().then(() => resolve(result));
                    },
                    cancel() {
                        if (!open.value) {
                            return;
                        }

                        void closeModal().then(() => reject(new CancelError()));
                    },
                };

                localModals.push(handler);
                allModals.push(handler);

                const historyHandle = virtualHistory.pushState(handler.cancel);

                const vmPromise = new Promise<void>((resolve) => {
                    const vm = new Vue({
                        parent: currentInstance ?? undefined,
                        render(h) {
                            const component = open.value ? view : undefined;

                            const node = h(component, {
                                props: {
                                    ...props,
                                    modal: handler,
                                },
                                on: {
                                    'hook:beforeDestroy': beforeDestroy,
                                },
                            });

                            return node;
                        },
                    });

                    vm.$mount();
                    disableBodyScroll(vm.$el);

                    const body = currentInstance?.$el.ownerDocument?.body ?? document.body;
                    body.appendChild(vm.$el);

                    async function beforeDestroy() {
                        if (open.value) {
                            // modal is still open, there is some v-if in the modal component
                            return;
                        }

                        enableBodyScroll(vm.$el);
                        resolve();
                    }
                });

                async function closeModal() {
                    open.value = false;

                    // remove it from modal queue
                    localModals.splice(localModals.indexOf(handler), 1);
                    allModals.splice(allModals.indexOf(handler), 1);

                    historyHandle.cancel();
                    await vmPromise;
                }
            });

            return promise;
        },
        closeAll() {
            allModals.forEach((m) => m.cancel());
        },
    };
}

function unwrapModalComponent<T>(modal: ModalComponentView<T>) {
    if (modal instanceof Promise) {
        // unwrap the view promise
        const viewPromise = modal;
        return () => viewPromise.then((v) => v.default);
    }

    if (modal instanceof Function) {
        const fcn = modal;
        return () => {
            const promise = fcn() as Promise<any>;

            return promise.then((x) => {
                if (x.default) {
                    return x.default;
                }

                return x;
            });
        };
    }

    return modal;
}
