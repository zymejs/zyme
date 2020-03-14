import {
    getCurrentInstance,
    computed,
    PropType,
    ref,
    watch,
    onUnmounted,
    Ref
} from '@vue/composition-api';

import { reactive, prop } from '../composition';
import { injectFormContext } from './useForm';
import { FormPart } from './types';

export interface FieldProps<T> {
    field?: string | number;
    value?: T;
    disabled?: boolean;
}

export function useFormFieldProps<T>(type: PropType<T>) {
    return {
        field: prop<string | number>([String, Number]).optional(),
        value: prop(type).optional(),
        disabled: prop(Boolean).optional()
    };
}

export function useFormField<T>(props: FieldProps<T>, element: Ref<HTMLElement | Vue | null>) {
    const vm = getCurrentInstance();
    if (!vm) {
        throw new Error('Must be called in setup() function');
    }

    const formPart = useFormFieldPart(props, element);

    // value of the field
    const value = computed(() => {
        const field = formPart.value;
        if (field) {
            return field.model;
        }

        return props.value;
    });

    // errors for the field
    const errors = computed(() => formPart.value?.errors ?? []);

    // is the field disabled
    const disabled = computed(() => {
        if (props.disabled || formPart.value?.disabled) {
            return true;
        }

        return false;
    });

    return reactive({
        value,
        errors,
        disabled,

        input(v: T) {
            const field = formPart.value;
            if (field) {
                field.model = v;
            }

            vm.$emit('input', v);
        },

        clearErrors() {
            const field = formPart.value;
            if (field) {
                field.clearErrors();
            }
        }
    });
}

function useFormFieldPart<T>(props: FieldProps<T>, element: Ref<HTMLElement | Vue | null>) {
    const formCtx = injectFormContext<any>();
    const formPart = ref<FormPart<T>>(null);

    if (formCtx) {
        watch(
            () => props.field,
            field => {
                if (formPart.value) {
                    formPart.value.remove();
                }

                if (field) {
                    formPart.value = formCtx.registerPart({
                        field: field,
                        handleErrors: true,
                        element: element
                    });
                } else {
                    formPart.value = null;
                }
            }
        );

        onUnmounted(() => {
            if (formPart.value) {
                formPart.value.remove();
                formPart.value = null;
            }
        });
    }

    return formPart;
}
