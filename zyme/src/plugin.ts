import Vue from 'vue';

import { IocPlugin } from './ioc/plugin';

export function ZymePlugin(vue: typeof Vue) {
    Object.defineProperty(vue.prototype, '$vm', {
        get() {
            return this;
        },
    });

    IocPlugin(vue);
}
