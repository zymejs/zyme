/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue, { ComponentOptions } from 'vue';
import { getCurrentInstance } from '@vue/composition-api';
import { prop, CancelError, PropTypes } from 'zyme';

import { getScrollBarWidth } from '../utils';

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

interface ModalHandler<T> {
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
    const currentInstance = getCurrentInstance();

    return {
        open<T extends ModalComponentOptions<any, any>>(options: OpenModalOptions<T>) {
            const view = unwrapModalComponent(options.modal);
            const props = (options as OpenModalOptionsWithProps<T>).props;

            const promise = new Promise<ModalResult<T>>((resolve, reject) => {
                const handler: ModalHandler<ModalResult<T>> = {
                    done(result) {
                        resolve(result);
                        closeModal();
                    },
                    cancel() {
                        reject(new CancelError());
                        closeModal();
                    },
                };

                modals.push(handler);

                updateBodyMargin();

                const vm = new Vue({
                    parent: currentInstance ?? undefined,
                    render: (h) =>
                        h(view, {
                            props: {
                                ...props,
                                modal: handler,
                            },
                        }),
                });

                vm.$mount();

                const body = currentInstance?.$el.ownerDocument?.body ?? document.body;
                body.appendChild(vm.$el);

                function closeModal() {
                    vm.$destroy();
                    vm.$el.remove();
                    // remove it from modal queue
                    modals.splice(modals.indexOf(handler), 1);

                    updateBodyMargin();
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

let originalBodyMargin: string | null = null;
let originalBodyOverflow: string | null = null;

function updateBodyMargin() {
    if (modals.length) {
        originalBodyOverflow = document.body.style.overflowY;
        originalBodyMargin = document.body.style.marginRight;

        document.body.style.overflowY = 'hidden';
        document.body.style.marginRight = getScrollBarWidth() + 'px';
    } else {
        document.body.style.overflowY = originalBodyOverflow || '';
        document.body.style.marginRight = originalBodyMargin || '';
    }
}
