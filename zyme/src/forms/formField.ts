import { computed, ref, set, PropType, Ref } from '@vue/composition-api';

import { prop, reactive, requireCurrentInstance, unref } from '../core';

import { injectFormContext, FormContext } from './formContext';
import { getMeta } from './formMeta';

type FieldType = string | number | null | undefined;

export interface FormPartProps {
    field?: FieldType;
    model?: object | any[];
}

export interface FormFieldProps<T> extends FormPartProps {
    value?: T | null;
    disabled?: boolean | null;
}

export interface FormPart {
    /** Reactive collection of errors for this form part. */
    readonly errors: readonly string[];
}

export interface FormField<T = unknown> extends FormPart {
    /** Form model for this part */
    readonly value: Readonly<T | null | undefined>;

    readonly disabled: Readonly<boolean>;

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

export function useFormFieldProps<T>(type?: PropType<T>) {
    return {
        ...useFormPartProps({ defaultField: null }),
        value: prop(type).optional(),
        disabled: prop(Boolean).optional()
    };
}

export function useFormPart(props: FormPartProps): FormPart {
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

export function useFormField<T>(props: FormFieldProps<T>): FormField<T> {
    const vm = requireCurrentInstance();

    const formCtx = injectFormContext();

    if (formCtx) {
        const model = getModelRef(formCtx, props);
        const value = getValueForField(model, props);
        const errors = getErrorsForField(model, props);
        const disabled = computed(() => props.disabled || formCtx.form.busy || false);

        const field = reactive({
            value: value,
            errors: errors,
            disabled: disabled,

            input(v: T) {
                vm.$emit('input', v);

                if (props.value !== undefined) {
                    return;
                }

                const modelValue = model.value;
                const fieldValue = props.field;

                if (modelValue != null && fieldValue != null) {
                    set(modelValue, fieldValue, v);
                }
            },

            clearErrors() {
                // TODO
            }
        });

        return field as FormField<T>;
    } else {
        const value = computed(() => props.value ?? null);
        const errors = ref<string[]>([]);
        const disabled = computed(() => props.disabled || false);

        const field = reactive({
            value: value,
            errors: errors,
            disabled: disabled,

            input(v: T) {
                vm.$emit('input', v);
            },

            clearErrors() {
                // nothing without form context
            }
        });

        return field as FormField<T>;
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

function getValueForField<T>(model: Ref<object>, props: FormFieldProps<T>): Ref<T | null> {
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

function getErrorsForField<T>(model: Ref<object>, props: FormFieldProps<T>) {
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
