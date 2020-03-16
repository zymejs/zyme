import { ref, Ref, set } from '@vue/composition-api';
import { reactive, writable } from 'zyme';

import { FormModel } from './formModel';
import { FormError, ValidationError } from './formErrors';
import { getMeta } from './formMeta';
import {
    normalizeErrorExpression,
    normalizeErrorKey,
    combineErrorExpressions
} from './formErrorExpression';

type FormSubmit<T, R> = (m: NonNullable<T>) => Promise<R>;

type FormModelInit<T> = {
    [K in keyof FormModel<T>]: FormModelInit<T>[K] | Ref<FormModel<T>[K]>;
};

let creatingForm = false;

export function createForm<T extends {}>(model: FormModelInit<T>): Form<T>;
export function createForm<T extends {}>(model: null): Form<T | null>;
export function createForm<T extends {} | null>(model: FormModelInit<T> | null): Form<T> {
    try {
        creatingForm = true;
        const form = new Form(model as T);
        return reactive<Form<T>>(form);
    } finally {
        creatingForm = false;
    }
}

export class Form<T = unknown> {
    constructor(model: T) {
        if (!creatingForm) {
            throw new Error(`Use createForm() function instead of constructor.`);
        }

        this.model = model;
    }

    public model: T;
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

        for (let error of errors) {
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

function propagateErrors<T>(prefix: string, model: T | null, errors: readonly FormError[]) {
    if (!model || typeof model === 'string') {
        return;
    }

    const currentErrors = getErrorsForExpr(errors, prefix);

    if (Array.isArray(model)) {
        const meta = getMeta(model);

        set(meta.errors, '', currentErrors);

        for (let i = 0; i < model.length; i++) {
            const expr = combineErrorExpressions(prefix, i.toString());

            propagateErrors(expr, model[i], currentErrors);
        }
    } else if (model instanceof Object) {
        const meta = getMeta(model as any);

        set(meta.errors, '', currentErrors);

        for (let prop of Object.keys(model)) {
            const value = (model as any)[prop];
            const key = normalizeErrorKey(prop);
            const expr = combineErrorExpressions(prefix, key);

            propagateErrors(expr, value, currentErrors);
        }
    }
}

function getErrorsForExpr(errors: readonly FormError[], expr: string) {
    const prefix = expr + '.';
    return errors.filter(e => e.key === expr || e.key.startsWith(prefix));
}
