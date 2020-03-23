import Vue, { ComponentOptions } from 'vue';
import { onUnmounted, prop, requireCurrentInstance, PropTypes } from '../core';
import { getScrollBarWidth } from './scrollbarWidth';

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
    | (() => Promise<{ default: T }>);

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

const allModals: ModalHandler<unknown>[] = [];

export function useModalProps<T = void>() {
    return {
        modal: prop<ModalHandler<T>>().required()
    };
}

export function useModal<T extends ModalComponentOptions<any, any>>(modal: ModalComponentView<T>) {
    const view = unwrapModalComponent(modal);
    const currentInstance = requireCurrentInstance();

    const localModals: ModalHandler<unknown>[] = [];

    onUnmounted(() => {
        // close all modals when component is unmounted
        for (const m of localModals) {
            m.cancel();
        }
    });

    return {
        open(props: ModalProps<T>): Promise<ModalResult<T>> {
            const promise = new Promise<ModalResult<T>>((resolve, reject) => {
                const handler: ModalHandler<ModalResult<T>> = {
                    done(result) {
                        resolve(result);
                        closeModal();
                    },
                    cancel() {
                        reject();
                        closeModal();
                    }
                };

                allModals.push(handler);
                localModals.push(handler);

                updateBodyMargin();

                const vm = new Vue({
                    parent: currentInstance,
                    render: h =>
                        h(view, {
                            props: {
                                ...props,
                                modal: handler
                            }
                        })
                });

                vm.$mount();

                currentInstance.$el.ownerDocument?.body.appendChild(vm.$el);

                function closeModal() {
                    vm.$destroy();
                    vm.$el.remove();
                    // remove it from modal queue
                    allModals.splice(allModals.indexOf(handler), 1);
                    localModals.splice(localModals.indexOf(handler), 1);

                    updateBodyMargin();
                }
            });

            return promise;
        }
    };
}

function unwrapModalComponent<T>(modal: ModalComponentView<T>) {
    if (modal instanceof Promise) {
        // unwrap the view promise
        const viewPromise = modal;
        return () => viewPromise.then(v => v.default);
    }

    if (modal instanceof Function) {
        const fcn = modal;
        return () => {
            const promise = fcn() as Promise<any>;

            return promise.then(x => {
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
    if (allModals.length) {
        originalBodyOverflow = document.body.style.overflowY;
        originalBodyMargin = document.body.style.marginRight;

        document.body.style.overflowY = 'hidden';
        document.body.style.marginRight = getScrollBarWidth() + 'px';
    } else {
        document.body.style.overflowY = originalBodyOverflow || '';
        document.body.style.marginRight = originalBodyMargin || '';
    }
}
