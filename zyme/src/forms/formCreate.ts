import { reactive, Ref } from '@vue/composition-api';
import { writable } from 'zyme';

import { normalizeErrorExpression } from './formErrorHelpers';
import { propagateErrors } from './formErrorPropagate';
import { FormError, ValidationError } from './formErrorTypes';
import { FormModelBase } from './formFieldTypes';
import { FormModel } from './formModel';
import { FormRoot, FormSubmit } from './formTypes';

type FormModelProps<T> = {
    [K in keyof FormModel<T>]: FormModel<T>[K] | Ref<FormModel<T>[K]>;
};

type FormModelInit<T> = T extends null ? FormModelProps<T> | null : FormModelProps<T>;

export function createForm<T extends FormModelBase>(model: FormModel<T>): FormRoot<T>;
export function createForm<T extends FormModelBase>(model: FormModelInit<T>): FormRoot<T>;
export function createForm<T extends FormModelBase>(model: null): FormRoot<T>;
export function createForm<T extends FormModelBase>(model: FormModelInit<T> | null): FormRoot<T> {
    const form = new FormImpl<T>(model);

    return reactive(form as any) as FormRoot<T>;
}

export function createFormAsync<T extends {}>(fcn: () => Promise<FormModel<T>>): FormRoot<T> {
    const form = new FormImpl<T>(null);

    // async loading of the form
    fcn().then(m => {
        form.model = m;
    });

    return (reactive(form) as any) as FormRoot<T>;
}

class FormImpl<T extends FormModelBase> extends FormRoot<T> {
    constructor(model: FormModelInit<T> | null) {
        super();
        this.model = reactive(model) as T;
    }

    public model: T;
    public readonly disabled: boolean = false;
    public readonly errors: readonly FormError[] = [];

    public async submit<R>(action: FormSubmit<T, R>): Promise<R> {
        const model = this.model;
        if (model == null) {
            throw new Error('No model is set to submit');
        }
        try {
            writable(this).disabled = true;

            const result = await action(model as NonNullable<T>);
            this.clearErrors();

            return result;
        } catch (error) {
            if (error instanceof ValidationError) {
                this.setErrors(error.errors);
            }
            throw error;
        } finally {
            writable(this).disabled = false;
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
