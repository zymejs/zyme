import { reactive, Ref } from '@vue/composition-api';

import { FormField, FormFieldWrapper } from './formFieldTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormFieldProps<TField extends FormField<any>> = {
    [K in keyof TField]: TField[K] | Readonly<Ref<TField[K]>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createFieldCore<TField extends FormField<any>>(
    field: TField,
    props: FormFieldProps<TField>
) {
    Object.assign(field, props);
    return (reactive(field) as unknown) as FormFieldWrapper<TField>;
}
