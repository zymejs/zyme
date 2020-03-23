import { set, Ref } from '@vue/composition-api';

import { reactive } from '../core';
import { writable } from '../utils';

import {
    combineErrorExpressions,
    normalizeErrorExpression,
    normalizeErrorKey
} from './formErrorExpression';
import { FormError, ValidationError } from './formErrors';
import { getMeta, FormModelMetadata } from './formMeta';
import { FormModel } from './formModel';

type FormSubmit<T, R> = (m: NonNullable<T>) => Promise<R>;

type FormModelInit<T> = {
    [K in keyof FormModel<T>]: FormModelInit<T>[K] | Ref<FormModel<T>[K]>;
};

let creatingForm = false;

export function createForm<T extends {}>(fcn: () => Promise<FormModel<T>>): Form<T | null>;
export function createForm<T extends {}>(model: FormModelInit<T>): Form<T>;
export function createForm<T extends {}>(model: null): Form<T | null>;
export function createForm<T extends {} | null>(
    model: FormModelInit<T> | null | (() => Promise<FormModel<T>>)
): Form<T> {
    try {
        creatingForm = true;

        const form = new Form();

        if (model instanceof Function) {
            // async loading of the form
            model().then(m => {
                form.model = m;
            });
        } else {
            form.model = model;
        }

        return reactive(form as any) as Form<T>;
    } finally {
        creatingForm = false;
    }
}

export class Form<T = unknown> {
    constructor() {
        if (!creatingForm) {
            throw new Error(`Use createForm() function instead of constructor.`);
        }
    }

    public model: T = null as any;
    public readonly busy: boolean = false;
    public readonly errors: readonly FormError[] = [];

    public async submit<R>(action: FormSubmit<T, R>): Promise<R> {
        const model = this.model;
        if (model == null) {
            throw new Error('No model is set to submit');
        }
        try {
            writable(this).busy = true;

            const result = await action(model as NonNullable<T>);
            this.clearErrors();

            return result;
        } catch (error) {
            if (error instanceof ValidationError) {
                this.setErrors(error.errors);
            }
            throw error;
        } finally {
            writable(this).busy = false;
        }
    }

    public setErrors(errors: FormError[]) {
        const currentErrors = writable(this.errors);
        currentErrors.length = 0;

        for (const error of errors) {
            currentErrors.push({
                key: normalizeErrorExpression(error.key),
                message: error.message
            });
        }

        this.propagateErrors();
    }

    public clearErrors() {
        writable(this.errors).length = 0;
        this.propagateErrors();
    }

    private propagateErrors() {
        propagateErrors('', this.model, this.errors);
    }
}

function propagateErrors<T>(expr: string, model: T | null, errors: readonly FormError[]) {
    if (!isObjectModel(model)) {
        return;
    }

    const errorsToPropagate: FormError[] = [];

    // we use dot as a separator between expression parts
    const prefix = expr ? expr + '.' : '';

    const errorsForModel: FormModelMetadata['errors'] = {};

    for (const error of errors) {
        // ignore errors that does not match the prefix
        if (error.key.startsWith(prefix) === false) {
            continue;
        }

        // trim the prefix
        const keyWithoutPrefix = error.key.substr(prefix.length);

        const propertyName = getFirstPropertyFromExpression(keyWithoutPrefix);

        let errorsForProperty = errorsForModel[propertyName];
        if (!errorsForProperty) {
            errorsForModel[propertyName] = errorsForProperty = [];
        }

        // add this error to the property
        errorsForProperty.push(error);

        // add this error to propagate it further
        errorsToPropagate.push(error);
    }

    // update errors for this model
    getMeta(model).errors = errorsForModel;

    if (Array.isArray(model)) {
        // propagate errors for items of the array
        for (let i = 0; i < model.length; i++) {
            const propKey = i.toString();
            const propExpr = combineErrorExpressions(expr, propKey);

            propagateErrors(propExpr, model[i], errorsToPropagate);
        }
    } else {
        // propagate errors for properties of the object
        for (const prop of Object.keys(model)) {
            const value = (model as any)[prop];
            const propKey = normalizeErrorKey(prop);
            const propExpr = combineErrorExpressions(expr, propKey);

            propagateErrors(propExpr, value, errorsToPropagate);
        }
    }
}

function isObjectModel(model: any): model is object {
    return model != null && model instanceof Object;
}

function getFirstPropertyFromExpression(expr: string) {
    if (!expr) {
        // empty property means the root of the object
        return '';
    }

    const nextDotIndex = expr.indexOf('.');

    if (nextDotIndex > 0) {
        // if there are more nested props, take only first
        return expr.substr(0, nextDotIndex);
    }

    // if there is no more nested props, the whole expression is a prop
    return expr;
}
