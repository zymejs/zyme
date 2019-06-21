import Vue, { ComponentOptions as VueComponentOptions } from 'vue';

import { ComponentOptions } from './defs';
import * as reflection from './reflection';

// this is kind of a hack - Vue.util is not a part of official API
declare module 'vue/types/vue' {
    interface VueConstructor {
        readonly util: any;
    }
}

export function setupComponent(component: any, options: ComponentOptions) {
    let vueOptions: VueComponentOptions<Vue> = {
        name: options.name || component.name
    };

    reflection.getDecorators(component).forEach(d => d(vueOptions));

    if (component.prototype.render) {
        vueOptions.render = component.prototype.render;
    }

    if (options && options.components) {
        vueOptions.components = options.components;
    }

    let proto = component.prototype;

    Object.getOwnPropertyNames(proto).forEach(key => {
        if (key === 'constructor') {
            return;
        }

        let descriptor = Object.getOwnPropertyDescriptor(proto, key) as PropertyDescriptor;

        if (descriptor.get || descriptor.set) {
            let computed = vueOptions.computed || (vueOptions.computed = {});
            computed[key] = {
                get: descriptor.get,
                set: descriptor.set
            };
        }
    });

    return extendComponent(component, vueOptions);
}

function extendComponent(component: any, options: VueComponentOptions<Vue>) {
    let base = Object.getPrototypeOf(component);

    component.options = (Vue as any).util.mergeOptions(base.options, options);

    component.extend = base.extend;
    component.mixin = base.mixin;
    component.use = base.use;

    component.super = base;

    if (options.name) {
        component.options.components[options.name] = component;
    }

    component.superOptions = base.options;
    component.extendOptions = options;
    component.sealedOptions = Object.assign({}, component.options);

    return component;
}
