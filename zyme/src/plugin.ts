import Vue from 'vue';

import { IocPlugin } from './ioc/plugin';
import { emitAsync } from './methods/EmitAsync';

export function ZymePlugin(vue: typeof Vue) {
    Object.defineProperty(vue.prototype, '$vm', {
        get() {
            return this;
        }
    });

    vue.prototype.$emitAsync = emitAsync;

    IocPlugin(vue);
}
