import { computed, inject, provide, reactive, Ref } from '@vue/composition-api';

import { Form } from './form';
import { FormModel } from './formModel';

export interface FormContext {
    readonly form: Form;
    readonly model: unknown;
    submit(): Promise<void>;
}

export interface FormContextRootOptions {
    readonly form: Form;
    submit(): Promise<void>;
}

export interface FormContextChildOptions<T> {
    readonly model: Readonly<Ref<FormModel<T>>>;
}

const FormContextSymbol = Symbol('FormContext');

export function provideFormContext<T>(options: FormContextChildOptions<T>): void;
export function provideFormContext(options: FormContextRootOptions): void;
export function provideFormContext(
    options: FormContextRootOptions | FormContextChildOptions<any>
): void {
    if (isRoot(options)) {
        const form = options.form;
        const ctx = reactive({
            form: form,
            submit: options.submit,
            model: computed(() => form.model)
        });

        provide(FormContextSymbol, ctx);
    } else {
        const parent = injectFormContext();
        if (!parent) {
            throw new Error('No parent form context provided');
        }

        const ctx = reactive({
            form: parent.form,
            submit: parent.submit,
            model: options.model
        });

        provide(FormContextSymbol, ctx);
    }
}

function isRoot(
    opts: FormContextRootOptions | FormContextChildOptions<any>
): opts is FormContextRootOptions {
    return (opts as FormContextRootOptions).form != null;
}

export function injectFormContext() {
    return inject<FormContext | null>(FormContextSymbol, null);
}
