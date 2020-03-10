import Vue from 'vue';
import { IocRegisterOptions } from './decorators';
import { IocContainer } from './container';

export function IocPlugin(vue: typeof Vue) {
    vue.directive('ioc-container', {});

    // allows to use custom component options
    vue.config.optionMergeStrategies.iocInject = iocOptionMerge;
    vue.config.optionMergeStrategies.iocProvide = iocOptionMerge;
    vue.config.optionMergeStrategies.iocRegister = iocRegisterMerge;

    vue.mixin({
        provide(this: Vue) {
            return { [IocContainer.symbol]: () => this.$container };
        },
        created(this: Vue) {
            const options = this.$options;

            // takes container that is specified in options
            let container = options.container;

            // try get container provided by directive
            if (!container) {
                let vnode = this.$vnode;
                let directives = vnode && vnode.data && vnode.data.directives;
                if (directives) {
                    let directive = directives.find(d => d.name === 'ioc-container');
                    container = directive && directive.value;
                }
            }

            // try get container from parent or prototype
            if (!container) {
                container = (this.$parent && this.$parent.$container) || this.$container;
            }

            // no container found - nothing to do here
            if (!container) {
                return;
            }

            const iocRegister = options.iocRegister;
            const iocProvide = options.iocProvide;
            const iocInject = options.iocInject;

            // if component provides anything we need to create a child container
            // so child components would have their own dependency scope
            if (iocProvide || iocRegister) {
                container = container.createChild();
            }

            (this as any)[IocContainer.symbol] = container;

            // configure register services
            if (iocRegister) {
                for (const register of iocRegister) {
                    register(container);
                }
            }

            // configure provided values
            if (iocProvide) {
                for (let prop of Object.keys(iocProvide)) {
                    let provideConfig = iocProvide[prop];

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
            if (iocInject) {
                for (let prop of Object.keys(iocInject)) {
                    let injectConfig = iocInject[prop];

                    if (!injectConfig.optional || container.isBound(injectConfig.identifier)) {
                        (this as any)[prop] = container.get(injectConfig.identifier);
                    }
                }
            }
        }
    });
}

function iocRegisterMerge(parentVal?: IocRegisterOptions, childVal?: IocRegisterOptions) {
    if (!parentVal) {
        return childVal;
    }

    if (!childVal) {
        return parentVal;
    }

    return parentVal.concat(childVal);
}

function iocOptionMerge(parentVal: object, childVal: object) {
    return parentVal || childVal ? Object.assign({}, parentVal, childVal) : null;
}
