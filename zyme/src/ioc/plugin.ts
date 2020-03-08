import Vue from 'vue';

import { IocContainer } from './container';

export function IocPlugin(vue: typeof Vue) {
    Object.defineProperty(vue.prototype, '$container', {
        get() {
            return this[IocContainer.symbol];
        }
    });

    vue.directive('ioc-container', {});

    // allows to use custom component options
    vue.config.optionMergeStrategies.iocInject = iocOptionMerge;
    vue.config.optionMergeStrategies.iocProvide = iocOptionMerge;

    vue.mixin({
        provide(this: Vue) {
            return { [IocContainer.symbol]: () => this.$container };
        },
        created(this: Vue) {
            // takes container that is specified in options
            let container = this.$options.container;

            // try get container provided by directive
            if (!container) {
                let vnode = this.$vnode;
                let directives = vnode && vnode.data && vnode.data.directives;
                if (directives) {
                    let directive = directives.find(d => d.name === 'ioc-container');
                    container = directive && directive.value;
                }
            }

            // try get container from parent
            if (!container) {
                container = this.$parent && this.$parent.$container;
            }

            // no container found - nothing to do here
            if (!container) {
                return;
            }

            // if component provides anything we need to create a child container
            // so child components would have their own dependency scope
            let provides = this.$options.iocProvide;
            if (provides) {
                container = container.createChild();
            }

            (this as any)[IocContainer.symbol] = container;

            // configure provided values
            if (provides) {
                for (let prop of Object.keys(provides)) {
                    let provideConfig = provides[prop];

                    if (provideConfig.resolve) {
                        // provided value will resolved now and serve as singleton for child components
                        container
                            .bind(provideConfig.identifier)
                            .to(provideConfig.resolve)
                            .inSingletonScope();
                    } else {
                        // provided value will be resolved at runtime with
                        // object property or function call
                        container.bind(provideConfig.identifier).toDynamicValue(() => {
                            let value = (this as any)[prop];
                            return typeof value === 'function' ? value.call(this) : value;
                        });
                    }
                }
            }

            // inject values
            let injects = this.$options.iocInject;
            if (injects) {
                for (let prop of Object.keys(injects)) {
                    let injectConfig = injects[prop];

                    if (!injectConfig.optional || container.isBound(injectConfig.identifier)) {
                        (this as any)[prop] = container.get(injectConfig.identifier);
                    }
                }
            }
        }
    });
}

function iocOptionMerge(parentVal: object, childVal: object) {
    return parentVal || childVal ? Object.assign({}, parentVal, childVal) : null;
}
