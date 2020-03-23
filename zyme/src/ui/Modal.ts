import Vue, { ComponentOptions } from 'vue';
import {
    mixin,
    onUnmounted,
    prop,
    requireCurrentInstance,
    PropTypes,
    provideService
} from '../core';

const modalHandlerSymbol = Symbol('modal');

type ModalHandlerProps<TResult> = {
    [modalHandlerSymbol]: ModalHandler<TResult>;
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
type ModalPropsWithoutHandler<T> = Omit<ModalPropsBase<T>, typeof modalHandlerSymbol>;

type ModalProps<T> = keyof ModalPropsWithoutHandler<T> extends never
    ? void
    : ModalPropsWithoutHandler<T>;

type ModalResult<T> = T extends ModalComponentOptions<infer TResult, any> ? TResult : never;

// export type OpenModelOptions<
//     TResult,
//     TProps extends ModalHandlerProps<TResult>,
//     TModal extends ModalComponentOptions<TResult, TProps>
// > = {
//     modal: TModal;
//     props: TProps;
// };

// type ModalProps<T> =
//     // this one checks if there are some properties - if no, it wont allow using component as modal
//     ComponentProps<T> extends void
//         ? never // this checks if properties include a special property for the modal handler
//         : ComponentProps<T> extends ModalHandlerProps<any> // we check if there are any props left after removing modal handler // because it's automaticlaly added
//         ? keyof ModalPropsWithoutHandler<T> extends never
//             ? {}
//             : { props: ModalPropsWithoutHandler<T> }
//         : never;

// type ModalPropsWithoutHandler<T> = Omit<ComponentProps<T>, typeof modalHandlerSymbol>;

interface ModalHandler<T> {
    resolve(result: T): void;
    reject(): void;
}

export function useModalMixin<T = void>() {
    return mixin({
        props: useModalProps<T>(),
        setup(props, ctx) {
            return {
                done(result: T) {
                    props[modalHandlerSymbol].resolve(result);
                },
                cancel() {
                    props[modalHandlerSymbol].reject();
                }
            };
        }
    });
}

function useModalProps<T>() {
    return {
        [modalHandlerSymbol]: prop<ModalHandler<T>>().required()
    };
}

export function useModal<T extends ModalComponentOptions<any, any>>(modal: ModalComponentView<T>) {
    const view = unwrapModalComponent(modal);
    const currentInstance = requireCurrentInstance();

    const modals: ModalHandler<unknown>[] = [];

    onUnmounted(() => {
        // close all modals when component is unmounted
        for (const m of modals) {
            m.reject();
        }
    });

    return {
        open(props: ModalProps<T>): Promise<ModalResult<T>> {
            const promise = new Promise<ModalResult<T>>((resolve, reject) => {
                const handler: ModalHandler<ModalResult<T>> = {
                    resolve(result) {
                        resolve(result);
                        vm.$destroy();
                    },
                    reject() {
                        reject();
                        vm.$destroy();
                        // remove it from modal queue
                        modals.splice(modals.indexOf(handler), 1);
                    }
                };

                modals.push(handler);

                const vm = new Vue({
                    parent: currentInstance,
                    provide: {},
                    render: h =>
                        h(view, {
                            props: {
                                [modalHandlerSymbol]: handler,
                                ...props
                            }
                        })
                });

                vm.$mount();

                currentInstance.$el.ownerDocument?.body.appendChild(vm.$el);
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
