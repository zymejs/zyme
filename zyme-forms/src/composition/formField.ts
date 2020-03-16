import { computed, PropType, ref, watch, Ref } from '@vue/composition-api';
import { reactive, prop, unref, requireCurrentInstance } from 'zyme';

import { injectFormContext, FormContext } from './formContext';
import { getMeta } from './formMeta';

type FieldType = string | number | null | undefined;

export interface FormPartProps {
    field?: FieldType;
    model?: object | any[];
}

export interface FormInputProps<T> extends FormPartProps {
    value?: T | null;
    disabled?: boolean | null;
}

export interface FormPart {
    /** Reactive collection of errors for this form part. */
    readonly errors: readonly string[];
}

export interface FormInput<T = unknown> extends FormPart {
    /** Form model for this part */
    readonly value: T | null | undefined;

    readonly disabled: boolean;

    input(value: T | null | undefined): void;

    clearErrors(): void;
}

interface FormPartPropsOptions {
    defaultField: string | null;
}

export function useFormPartProps(opts: FormPartPropsOptions) {
    return {
        field: prop<string | number>([String, Number]).optional({
            default: opts.defaultField
        }),
        model: prop<object | any[]>().optional()
    };
}

export function useFormInputProps<T>(type: PropType<T>) {
    return {
        ...useFormPartProps({ defaultField: null }),
        value: prop(type).optional(),
        disabled: prop(Boolean).optional()
    };
}

export function useFormPart(props: FormPartProps) {
    const formCtx = injectFormContext();
    if (!formCtx) {
        throw new Error('No form context found');
    }

    const model = getModelRef(formCtx, props);
    const errors = getErrorsForField(model, props);

    return reactive<FormPart>({
        errors: unref(errors)
    });
}

export function useFormInput<T>(props: FormInputProps<T>) {
    const vm = requireCurrentInstance();

    const formCtx = injectFormContext();

    if (formCtx) {
        const model = getModelRef(formCtx, props);
        const value = getValueForField(model, props);
        const errors = getErrorsForField(model, props);
        const disabled = computed(() => props.disabled || formCtx.form.busy || false);

        return reactive<FormInput<T>>({
            value: unref(value),
            errors: unref(errors),
            disabled: unref(disabled),

            input(v: T) {
                vm.$emit('input', v);

                if (props.value !== undefined) {
                    return;
                }

                const modelValue = model.value;
                const fieldValue = props.field;

                if (modelValue != null && fieldValue != null) {
                    (modelValue as any)[fieldValue] = v;
                }
            },

            clearErrors() {
                // TODO
            }
        });
    } else {
        return reactive<FormInput<T>>({
            value: unref(computed(() => props.value)),
            errors: [],
            disabled: unref(computed(() => props.disabled ?? false)),

            input(v: T) {
                vm.$emit('input', v);
            },

            clearErrors() {
                // nothing without form context
            }
        });
    }
}

function getModelRef(formCtx: FormContext, props: FormPartProps) {
    return computed(() => {
        let model = props.model as any;
        if (model === undefined) {
            model = formCtx.form.model;
        }

        return model;
    });
}

function getValueForField<T>(model: Ref<object>, props: FormInputProps<T>): Ref<T | null> {
    return computed(() => {
        if (props.value !== undefined) {
            return props.value;
        }

        const modelValue = model.value;
        const fieldValue = props.field;

        if (modelValue != null && fieldValue != null) {
            return (modelValue as any)[fieldValue];
        }
    });
}

function getErrorsForField<T>(model: Ref<object>, props: FormInputProps<T>) {
    return computed(() => {
        const modelValue = model.value;
        const fieldValue = props.field;

        if (modelValue != null && fieldValue != null) {
            const meta = getMeta(modelValue);
            const errors = meta.errors[fieldValue.toString()] ?? [];

            return errors.map(e => e.message);
        }

        return [] as string[];
    });
}
