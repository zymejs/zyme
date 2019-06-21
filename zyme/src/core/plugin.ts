import Vue from 'vue';

export function CorePlugin(vue: typeof Vue) {
    Object.defineProperty(vue.prototype, '$vm', {
        get() {
            return this;
        },
    });
}
