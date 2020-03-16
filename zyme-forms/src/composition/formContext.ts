import { provide, inject } from '@vue/composition-api';

import { Form } from './form';

export interface FormContext {
    readonly form: Form;
    submit(): Promise<void>;
}

const FormContextSymbol = Symbol('FormContext');
export function provideFormContext(formContext: FormContext) {
    provide(FormContextSymbol, formContext);
}

export function injectFormContext() {
    return inject<FormContext | null>(FormContextSymbol, null);
}
