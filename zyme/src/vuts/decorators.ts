import Vue, { PropOptions, WatchOptions } from 'vue';

import * as cmp from './component';
import * as reflection from './reflection';

import { ComponentOptions, LifecycleAsyncCallback, LifecycleCallback } from './defs';

export function Component(): ClassDecorator;
export function Component(options: ComponentOptions): ClassDecorator;
export function Component(id: string, options?: ComponentOptions): ClassDecorator;
export function Component(
    idOrOptions?: string | ComponentOptions,
    options?: ComponentOptions
): ClassDecorator {
    // tslint:disable-next-line: ban-types
    return <T extends Function>(constructor: T) => {
        let id: string | undefined;
        if (typeof idOrOptions === 'string') {
            id = idOrOptions;
        } else {
            options = idOrOptions;
        }

        let c = cmp.setupComponent(constructor as any, options || {});

        if (id) {
            Vue.component(id, c);
        }

        return c;
    };
}

export function Ref(refName?: string) {
    return (target: any, propertyKey: string) => {
        reflection.addLifecycleHook(target, 'created', function(this: Vue) {
            Object.defineProperty(this, propertyKey, {
                get() {
                    return this.$refs[refName || propertyKey];
                }
            });
        });
    };
}

const propSymbol = Symbol('vuts:prop');

export function Prop(options?: PropOptions) {
    return (target: any, propertyKey: string) => {
        let propMeta = getMeta(target, propSymbol) as any;
        if (!propMeta) {
            target[propSymbol] = propMeta = {};

            reflection.addDecorator(target, opts => {
                if (!opts.props) {
                    opts.props = propMeta;
                } else {
                    Object.assign(opts.props, propMeta);
                }
            });
        }
        propMeta[propertyKey] = options || {};
    };
}

const dataSymbol = Symbol('vuts:data');

export function Data(defaultValue?: () => any): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        let dataMeta = getMeta(target, dataSymbol);
        if (!dataMeta) {
            target[dataSymbol] = dataMeta = {};

            reflection.addDecorator(target, opts => {
                opts.data = () => {
                    let values: Dictionary<any> = {};
                    for (let i in dataMeta) {
                        if (dataMeta.hasOwnProperty(i)) {
                            values[i] = dataMeta[i]();
                        }
                    }

                    return values;
                };
            });
        }

        dataMeta[propertyKey as string] = defaultValue || (() => null);
    };
}

const provideSymbol = Symbol('vuts:provide');

export function Provide(name?: string): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        let meta = getMeta(target, provideSymbol);
        if (!meta) {
            target[provideSymbol] = meta = {};

            reflection.addDecorator(target, opts => {
                opts.provide = function(this: any) {
                    const values = {};

                    for (let i in meta) {
                        if (meta.hasOwnProperty(i)) {
                            Object.defineProperty(values, i, {
                                enumerable: true,
                                get: () => this[propertyKey]
                            });
                        }
                    }

                    return values;
                };
            });
        }

        meta[name || (propertyKey as string)] = propertyKey;
    };
}

export function Inject(name?: string): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        reflection.addDecorator(target, opts => {
            let meta = opts.inject || ((opts.inject = {}) as any);
            meta[propertyKey] = {
                from: name || propertyKey
            };
        });
    };
}

export function Watch<T = any>(propName: keyof T, watchOptions?: WatchOptions): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        reflection.addDecorator(target, componentOptions => {
            if (!componentOptions.watch) {
                componentOptions.watch = {};
            }

            componentOptions.watch[propName as string] = Object.assign({
                handler: descriptor.value,
                watchOptions
            });
        });
    };
}

type LifecycleDescriptor =
    | TypedPropertyDescriptor<LifecycleCallback>
    | TypedPropertyDescriptor<LifecycleAsyncCallback>;

export function BeforeCreate(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'beforeCreate', descriptor.value);
}

export function Created(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'created', descriptor.value);
}

export function BeforeMount(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'beforeMount', descriptor.value);
}

export function Mounted(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'mounted', descriptor.value);
}

export function BeforeUpdate(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'beforeUpdate', descriptor.value);
}

export function Updated(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'updated', descriptor.value);
}

export function BeforeDestroy(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'beforeDestroy', descriptor.value);
}

export function Destroyed(
    target: object,
    propertyKey: string | symbol,
    descriptor: LifecycleDescriptor
) {
    reflection.addLifecycleHook(target, 'destroyed', descriptor.value);
}

function getMeta(target: object, symbol: symbol): Dictionary<any> | undefined {
    return target.hasOwnProperty(symbol) ? ((target as any)[symbol] as Dictionary<any>) : undefined;
}
