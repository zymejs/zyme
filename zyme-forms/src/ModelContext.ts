import isFunction from 'lodash-es/isFunction';

import { Model, ModelGeneric } from './Model';

export class ModelContext<T extends Model = ModelGeneric> {
    public model?: T;

    constructor(modelOrGetter: T | (() => T)) {
        if (isFunction(modelOrGetter)) {
            Object.defineProperty(this, 'model', {
                configurable: true,
                enumerable: true,
                get: modelOrGetter
            });
        } else {
            this.model = modelOrGetter as T;
        }
    }
}
