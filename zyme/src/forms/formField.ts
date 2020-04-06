import { computed, isRef, PropType, Ref } from '@vue/composition-api';

import { prop, reactive, requireCurrentInstance } from '../core';

import { basicField, fieldProxy, FormField } from './formBuilder';
import { injectFormContext, provideFormContext } from './formContext';
import { getMeta } from './formMeta';
import { FormModel } from './formModel';

type FieldType = string | number | null | undefined;

export interface FormFieldProps<T> {
    readonly field?: FieldType | FormField<T> | null;
    readonly value?: T | null;
    readonly disabled?: boolean;
}

export function useFormFieldProps<T>(type?: PropType<T>) {
    return {
        field: prop<string | number | FormField<T>>([String, Number, Object]).optional(),
        value: prop(type).optional({ default: undefined }),
        disabled: prop(Boolean).optional()
    };
}

export function useFormModel<T>(
    model: Readonly<Ref<Readonly<FormModel<T>>>> | (() => FormModel<T>)
) {
    if (!isRef(model)) {
        model = computed(model);
    }

    provideFormContext<T>({
        model
    });

    const modelRef = model;
    const errors = computed(() => {
        const meta = getMeta(modelRef.value);
        return meta.errors;
    });

    return reactive({
        model,
        errors
    });
}

export function useFormField<T>(props: FormFieldProps<T>) {
    const vm = requireCurrentInstance();

    const formCtx = injectFormContext();

    const fieldRef = computed(() => {
        const field = props.field;
        if (field instanceof Object) {
            return field;
        }

        if (formCtx?.form) {
            return basicField<any, any>({
                parent: formCtx.form,
                field: field
            });
        }
    });

    const proxy = fieldProxy<T>({
        value: () => {
            const field = fieldRef.value;
            if (field) {
                return field.value;
            }

            return props.value;
        },
        disabled: () => {
            const field = fieldRef.value;
            if (field) {
                return field.disabled;
            }

            return props.disabled ?? false;
        },
        errors: () => {
            const field = fieldRef.value;
            if (field) {
                return field.errors;
            }

            return [];
        },
        field: () => {
            const field = fieldRef.value;
            if (field) {
                return field.field;
            }

            return null;
        },
        form: () => {
            const field = fieldRef.value;
            if (field) {
                return field.form;
            }

            return null;
        },
        meta: () => {
            const field = fieldRef.value;
            if (field) {
                return field.meta;
            }

            return undefined;
        },
        model: () => {
            const field = fieldRef.value;
            if (field) {
                return field.model;
            }

            return null;
        },
        update: v => {
            vm.$emit('input', v);

            const field = fieldRef.value;
            if (field) {
                field.update(v);
            }
        }
    });

    return proxy;
}
