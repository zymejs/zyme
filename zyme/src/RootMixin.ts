import Vue from 'vue';

import { LogicError } from './core';

export const RootMixin = Vue.extend({
    errorCaptured(err, vm, info) {
        if (err instanceof LogicError) {
            return false;
        }
    }
});
