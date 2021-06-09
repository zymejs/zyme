import { ref } from '@vue/composition-api';
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

const modals: ModalHandler<unknown>[] = [];

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

export function useModal() {
    const currentInstance = getCurrentInstance()?.proxy;
    const virtualHistory = useVirtualHistory();

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

                modals.push(handler);

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
                                    'hook:mounted': onMounted,
                                    'hook:beforeDestroy': beforeDestroy,
                                },
                            });

                            return node;
                        },
                    });

                    vm.$mount();

                    async function onMounted() {
                        const modalElement = vm.$el.children[0];
                        if (modalElement) {
                            disableBodyScroll(modalElement);
                        }

                        const body = currentInstance?.$el.ownerDocument?.body ?? document.body;
                        body.appendChild(vm.$el);
                    }

                    async function beforeDestroy() {
                        if (open.value) {
                            // modal is still open, there is some v-if in the modal component
                            return;
                        }

                        const modalElement = vm.$el.children[0];
                        if (modalElement) {
                            enableBodyScroll(modalElement);
                        }

                        resolve();
                    }
                });

                async function closeModal() {
                    open.value = false;

                    // remove it from modal queue
                    modals.splice(modals.indexOf(handler), 1);

                    historyHandle.cancel();
                    await vmPromise;
                }
            });

            return promise;
        },
        closeAll() {
            modals.forEach((m) => m.cancel());
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
