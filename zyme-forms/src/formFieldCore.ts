import { computed, isRef, reactive, ref, Ref } from '@vue/composition-api';

import { FormField, FormFieldWrapper, RefParam } from './formFieldTypes';

export type FormFieldProps<TField extends FormField<any>> = {
    [K in keyof TField]: TField[K] | Readonly<Ref<TField[K]>>;
};

export function createFieldCore<TField extends FormField<any>>(
    field: TField,
    props: FormFieldProps<TField>
) {
    Object.assign(field, props);
    return (reactive(field) as unknown) as FormFieldWrapper<TField>;
}

export function toRef<T>(param: RefParam<T> | T): Readonly<Ref<T>> {
    if (isRef(param)) {
        return param;
    }

    if (param instanceof Function) {
        return computed(param);
    }

    return ref(param);
}
