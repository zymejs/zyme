import { computed, getCurrentInstance, PropType, ref, watch, Ref } from '@vue/composition-api';
import { reactive, prop, unref } from 'zyme';

import { injectFormContext, FormContext } from './formContext';

export interface FieldProps<T> {
    field?: string | number | null;
    value?: T | null;
    disabled?: boolean | null;
}

export interface FormField<T = unknown> {
    /** Form model for this part */
    readonly value: T | null | undefined;

    /** Reactive collection of errors for this form part. */
    readonly errors: readonly string[];

    readonly disabled: boolean;

    input(value: T | null | undefined): void;

    clearErrors(): void;
}

export interface FormFieldOptions<T, K extends keyof T> {
    /** Field of the model for this part to be bound to */
    readonly field: K;
}

export function useFormFieldProps<T>(type: PropType<T>) {
    return {
        field: prop<string | number>([String, Number]).optional(),
        value: prop(type).optional(),
        disabled: prop(Boolean).optional()
    };
}

export function useFormField<T>(props: FieldProps<T>) {
    const vm = getCurrentInstance();
    if (!vm) {
        throw new Error('Must be called in setup() function');
    }

    const formCtx = injectFormContext<any>();
    const fieldCtx = ref<FormContext<T>>(null);

    if (formCtx) {
        watch(
            () => props.field,
            field => {
                if (!field) {
                    fieldCtx.value = null;
                } else {
                    fieldCtx.value = formCtx.createField(field);
                }
            }
        );
    }

    const modelRef = computed(() => fieldCtx.value?.model ?? props.value);
    const errorsRef = computed(() => fieldCtx.value?.errors ?? []);
    const disabledRef = computed(() => props.disabled ?? false);

    return reactive<FormField<T>>({
        value: unref(modelRef),
        errors: unref(errorsRef),
        disabled: unref(disabledRef),

        input(v: T) {
            const field = fieldCtx.value;
            if (field) {
                field.model = v;
            }

            vm.$emit('input', v);
        },

        clearErrors() {
            // TODO
        }
    });
}
