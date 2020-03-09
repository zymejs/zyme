import { getCurrentInstance, computed, PropType, ref, provide, inject } from '@vue/composition-api';

import { FormField } from './types';
import { prop, reactive } from '../composition';

const inputSymbol = Symbol('input');

export interface FieldProps<T> {
    label?: string;
    field?: FormField<T>;
    value?: T;
    disabled?: boolean;
}

export function useInputProps<T>(type: PropType<T>) {
    return {
        label: prop(String).optional(),
        field: prop<FormField<T>>().optional(),
        value: prop(type).optional(),
        disabled: prop(Boolean).optional()
    };
}

export function useInput<T>(props: FieldProps<T>) {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('No Vue instance found!');
    }

    const value = computed(() => {
        const field = props.field;
        if (field) {
            return field.$ref.value;
        }

        return props.value;
    });

    const disabled = computed(() => props.disabled ?? false);
    const name = computed(() => props.field?.$name ?? null);
    const element = ref<HTMLElement>(null);
    const errors = computed(() => props.field?.$errors ?? []);
    const hasErrors = computed(() => errors.value.length > 0);
    const label = computed(() => props.label);

    const input = reactive({
        label,
        value,
        name,
        disabled,
        element,
        errors,
        hasErrors,

        // methods
        blur() {
            props.field?.$clearErrors();
            instance.$emit('blur');
        },
        focus() {
            instance.$emit('focus');
        },
        input(v: T) {
            const field = props.field;
            if (field) {
                field.$ref.value = v;
            }

            instance.$emit('input', v);
        }
    });

    provide(inputSymbol, input);

    return input;
}

export function injectInput() {
    return inject(inputSymbol);
}
