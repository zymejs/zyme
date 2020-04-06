import { computed, isRef, PropType, Ref } from '@vue/composition-api';

import { prop, reactive, requireCurrentInstance } from '../core';

import { basicField, FormField } from './formBuilder';
import { injectFormContext, provideFormContext } from './formContext';
import { getMeta } from './formMeta';
import { FormModel } from './formModel';

type FieldType = string | number | null | undefined;

export interface FormFieldProps<T> {
    readonly field?: FieldType | FormField<T> | null;
    readonly value?: T | null;
}

export function useFormFieldProps<T>(type?: PropType<T>) {
    return {
        field: prop<string | number | FormField>([String, Number, Object]).optional(),
        value: prop(type).optional({ default: undefined })
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

export function useBasicFormField<T>(props: FormFieldProps<T>) {
    const vm = requireCurrentInstance();

    const formCtx = injectFormContext();

    const fieldRef = computed(() => {
        const field = props.field;
        if (field instanceof Object) {
            return field;
        }

        if (formCtx?.form) {
            return basicField<any, any>({
                form: formCtx.form,
                field: field
            });
        }
    }) as Readonly<Ref<FormField<T> | undefined>>;

    const value = computed(() => {
        const field = fieldRef.value;
        if (field) {
            return field.value;
        }

        return props.value;
    });

    const errors = computed(() => {
        return fieldRef?.value?.errors ?? [];
    });

    const disabled = computed(() => {
        return fieldRef?.value?.disabled ?? false;
    });

    return reactive({
        value,
        errors,
        disabled,
        input(val: T) {
            if (disabled.value) {
                return;
            }

            vm.$emit('input', val);

            if (fieldRef.value) {
                fieldRef.value.value = val;
            }
        }
    });
}
