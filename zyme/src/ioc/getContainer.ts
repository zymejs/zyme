import Vue from 'vue';

import { IocContainer } from './container';

export function getContainer(vm: Vue): IocContainer | null {
    if (vm.hasOwnProperty('$container')) {
        return vm.$container;
    }

    // takes container that is specified in options
    let container = vm.$options.container;

    // try get container provided by directive
    if (!container) {
        let vnode = vm.$vnode;
        let directives = vnode && vnode.data && vnode.data.directives;
        if (directives) {
            let directive = directives.find(d => d.name === 'ioc-container');
            container = directive && directive.value;
        }
    }

    // try get container from parent
    if (!container) {
        let parent = vm.$parent;
        while (parent) {
            if (parent.hasOwnProperty('$container')) {
                return parent.$container;
            }

            parent = parent.$parent;
        }
    }

    // try get from prototype
    return Vue.prototype.$container;
}
