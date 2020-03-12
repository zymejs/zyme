import Vue from 'vue';

import { scrollTo } from './methods/ScrollTo';

declare module 'vue/types/vue' {
    interface Vue {
        $scrollTo(element: Element | Vue): void;
    }
}

export function UiWebPlugin(vue: typeof Vue) {
    vue.prototype.$scrollTo = scrollTo;
}
