import { Ref, computed, provide, inject } from '@vue/composition-api';
import { propRef, reactive, unref } from 'zyme';

import { FormModel } from './formModel';
import { getMeta } from './formMeta';

export interface FormContext<T> {
    model: T;
    readonly errors: readonly string[];
    readonly hasErrors: boolean;

    createField<K extends keyof T>(field: K): FormContext<T[K]>;
}

export function createFormContext<T>(model: Ref<FormModel<T>>): FormContext<T>;
export function createFormContext<T, K extends keyof T>(
    model: Ref<FormModel<T>>,
    field: K
): FormContext<T[K]>;
export function createFormContext<T, K extends keyof T>(model: Ref<FormModel<T>>, field?: K) {
    const errors = getErrorsRef(model, field ?? null);
    const hasErrors = computed(() => errors.value.length > 0);
    const value = field == null ? model : propRef(model, field);

    return reactive<FormContext<T | T[K]>>({
        model: unref(value as Ref<T | T[K]>),
        errors: unref(errors),
        hasErrors: unref(hasErrors),
        createField: f => createFormContext(value as any, f)
    });
}

function getErrorsRef<T>(model: Ref<FormModel<T>>, field: keyof T | null) {
    return computed(() => {
        const value = model.value;
        if (value) {
            const meta = getMeta(value);
            const fieldName = field?.toString() ?? '';
            return meta.errors[fieldName] ?? [];
        }

        return [] as string[];
    });
}

const FormContextSymbol = Symbol('FormContext');
export function provideFormContext<T>(FormContext: FormContext<T>) {
    provide(FormContextSymbol, FormContext);
}

export function injectFormContext<T = unknown>() {
    return inject<FormContext<T> | null>(FormContextSymbol, null);
}
