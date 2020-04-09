import { Ref } from '@vue/composition-api';

import { FormField } from './formFieldTypes';

export type FormFieldProxy<TField extends FormField<any>> = {
    [K in keyof TField]: TField[K] | Readonly<Ref<TField[K]>>;
};

export function createFieldProxy<TField extends FormField<any>>(
    field: TField,
    proxy: FormFieldProxy<TField>
) {}
