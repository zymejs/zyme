import { computed, PropType } from '@vue/composition-api';

import { prop, requireCurrentInstance } from '../core';
import { createFieldCore } from './formFieldCore';
import { FormField } from './formFieldTypes';

export interface FormFieldProps<T> {
    readonly field?: FormField<T> | null;
    readonly value?: T | null;
    readonly disabled?: boolean;
}

export function useFormFieldProps<T>(type?: PropType<T>) {
    return {
        field: prop<FormField<T>>([Object]).optional(),
        value: prop(type).optional({ default: undefined }),
        disabled: prop(Boolean).optional()
    };
}

export function useFormField<T>(props: FormFieldProps<T>) {
    const vm = requireCurrentInstance();

    const value = computed(() => {
        const field = props.field;
        if (field) {
            return field.value;
        }

        return props.value as T;
    });

    const disabled = computed(() => {
        return props.field?.disabled || props.disabled || false;
    });

    const errors = computed(() => {
        return props.field?.errors ?? [];
    });

    return createFieldCore(new FormField<T>(), {
        value,
        disabled,
        errors,
        update: v => {
            vm.$emit('input', v);
            props.field?.update(v);
        }
    });
}
