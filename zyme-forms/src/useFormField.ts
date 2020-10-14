import { computed, PropType } from '@vue/composition-api';
import { prop, requireCurrentInstance } from 'zyme';

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
        disabled: prop(Boolean).optional(),
    };
}

export function useFormField<T>(props: FormFieldProps<T> | (() => FormField<T>)) {
    const vm = requireCurrentInstance();

    if (props instanceof Function) {
        return useFormFieldProxy(props);
    }

    const update = (v: T) => {
        vm.$emit('input', v);
        props.field?.update(v);
    };

    const value = computed({
        get() {
            const field = props.field;
            if (field) {
                return field.value;
            }

            return props.value as T;
        },
        set: update,
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
        update,
    });
}

function useFormFieldProxy<T>(field: () => FormField<T>) {
    return createFieldCore(new FormField<T>(), {
        value: computed({
            get: () => field().value,
            set: (v) => field().update(v),
        }),
        disabled: computed(() => field().disabled),
        errors: computed(() => field().errors),
        update: (v) => field().update(v),
    });
}
