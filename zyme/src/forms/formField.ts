import { computed, ref, set, PropType, Ref } from '@vue/composition-api';

import { prop, reactive, requireCurrentInstance, unref, Refs, toRefs } from '../core';

import { injectFormContext, FormContext } from './formContext';
import { getMeta } from './formMeta';
import { normalizeErrorKey } from './formErrorExpression';

type FieldType = string | number | null | undefined;

export interface FormPartProps {
    field?: FieldType | null;
    model?: object | any[];
}

export interface FormFieldProps<T> extends FormPartProps {
    value?: T | null | undefined;
    disabled?: boolean;
}

export interface FormPart {
    /** Reactive collection of errors for this form part. */
    readonly errors: readonly string[];
}

export interface FormField<T = unknown> extends FormPart {
    /** Form model for this part */
    readonly value: Readonly<T | null | undefined>;

    readonly model: object | any[] | null;

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
        value: prop(type).optional({ default: undefined }),
        disabled: prop(Boolean).optional({
            default: false
        })
    };
}

export function useFormPart(props: FormPartProps | Refs<FormPartProps>): FormPart {
    const formCtx = injectFormContext();
    if (!formCtx) {
        throw new Error('No form context found');
    }
    const propRefs = toRefs(props);

    const model = getModelRef(formCtx, propRefs.model);
    const errors = getErrorsForField(model, propRefs.field);

    return reactive<FormPart>({
        errors: unref(errors)
    });
}

export function useFormField<T>(props: FormFieldProps<T> | Refs<FormFieldProps<T>>): FormField<T> {
    const vm = requireCurrentInstance();

    const formCtx = injectFormContext();
    const propRefs = toRefs(props);

    if (formCtx) {
        const model = getModelRef(formCtx, propRefs.model);
        const value = getValueForField(model, propRefs.value, propRefs.field);
        const errors = getErrorsForField(model, propRefs.field);
        const disabled = computed(() => props.disabled || formCtx.form.busy || false);

        const field = reactive({
            value: value,
            model: model,
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
            model: null,
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

function getModelRef(formCtx: FormContext, modelRef: Ref<any> | undefined): Readonly<Ref<any>> {
    // if no model is passed via props and no form is defined
    // there is no option there will be a model afterwards
    if (!modelRef && !formCtx) {
        return ref(undefined);
    }

    return computed(() => {
        let model = modelRef?.value;
        if (model === undefined) {
            model = formCtx.form.model;
        }

        return model;
    });
}

function getValueForField<T>(
    modelRef: Ref<any> | undefined,
    valueRef: Ref<any> | undefined,
    fieldRef: Ref<any> | undefined
): Ref<T | null> {
    return computed(() => {
        const value = valueRef?.value;
        if (value !== undefined) {
            return value;
        }

        const model = modelRef?.value;
        const field = fieldRef?.value;

        if (model != null && field != null) {
            return model[field];
        } else if (model != null) {
            return model;
        }
    });
}

function getErrorsForField(modelRef: Ref<object> | undefined, fieldRef?: Ref<any> | undefined) {
    if (!modelRef || !fieldRef) {
        return ref<string[]>([]);
    }

    return computed(() => {
        const model = modelRef.value;
        const field = fieldRef.value;

        if (model != null && field != null) {
            const meta = getMeta(model);
            // all error keys are normalized
            const fieldNormalized = normalizeErrorKey(field);
            const errors = meta.errors[fieldNormalized] ?? [];

            return errors.map(e => e.message);
        }

        return [] as string[];
    });
}
