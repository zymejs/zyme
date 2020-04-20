import { computed, reactive, Ref } from '@vue/composition-api';
import { unref, writable } from 'zyme';

import { getErrorsForModel, normalizeErrorExpression } from './formErrorHelpers';
import { propagateErrors } from './formErrorPropagate';
import { FormError, ValidationError } from './formErrorTypes';
import { FormFieldWrapper, FormModelBase } from './formFieldTypes';
import { FormModel } from './formModel';
import { Form, FormSubmit } from './formTypes';

type FormModelProps<T> = {
    [K in keyof FormModel<T>]: FormModel<T>[K] | Ref<FormModel<T>[K]>;
};

type FormModelInit<T> = T extends null ? FormModelProps<T> | null : FormModelProps<T>;

export function createForm<T extends FormModelBase>(model: FormModel<T>): FormFieldWrapper<Form<T>>;
export function createForm<T extends FormModelBase>(
    model: FormModelInit<T>
): FormFieldWrapper<Form<T>>;
export function createForm<T extends FormModelBase>(model: null): FormFieldWrapper<Form<T>>;
export function createForm<T extends FormModelBase>(
    model: FormModelInit<T> | null
): FormFieldWrapper<Form<T>> {
    const form = new FormImpl<T>(model);

    return reactive(form as any) as FormFieldWrapper<Form<T>>;
}

export function createFormAsync<T extends {}>(
    fcn: () => Promise<FormModel<T>>
): FormFieldWrapper<Form<T>> {
    const form = new FormImpl<T>(null);

    // async loading of the form
    fcn().then(m => {
        form.update(m);
    });

    return (reactive(form) as any) as FormFieldWrapper<Form<T>>;
}

class FormImpl<T extends FormModelBase> extends Form<T> {
    constructor(model: FormModelInit<T> | null) {
        super();
        const form = writable(this);

        form.value = model as T;
        form.errors = unref(computed(() => getErrorsForModel(form.value)));
        form.update = v => (form.value = v);
    }

    public readonly disabled: boolean = false;
    public readonly allErrors: readonly FormError[] = [];

    public async submit<R>(action: FormSubmit<T, R>): Promise<R> {
        const model = this.value;
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
        const currentErrors = writable(this.allErrors);
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
        writable(this.allErrors).length = 0;
        this.propagateErrors();
    }

    private propagateErrors() {
        propagateErrors('', this.value, this.allErrors);
    }
}
