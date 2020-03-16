import Vue from 'vue';

import { ValidationError } from './composition/formErrors';

export function FormsPlugin(vue: typeof Vue) {
    const oldHandler = vue.config.errorHandler;

    vue.config.errorHandler = (err, vm, info) => {
        if (err instanceof ValidationError) {
            console.warn(err.message, { exception: err, errors: err.errors });
            return true;
        }

        if (oldHandler) {
            return oldHandler(err, vm, info);
        }

        throw err;
    };
}
