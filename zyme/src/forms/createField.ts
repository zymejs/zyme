import { Ref, computed } from '@vue/composition-api';
import { isPlainObject } from 'lodash-es';

import { FormField, FormFieldSimple, FormFieldCollection, Form } from './types';
import { clearErrors } from './clearErrors';

export function createField<T>(form: Form, fieldRef: Ref<T>, name: string | null): FormField<T> {
    const field: FormFieldSimple<T> = {
        $name: name,
        $errors: [] as string[],
        $ref: fieldRef,
        $fields: {} as FormFieldCollection<T>,
        $form: form,
        $clearErrors: null as any
    };

    field.$clearErrors = () => clearErrors(field);

    const fieldValue = field.$ref.value;
    if (isPlainObject(fieldValue)) {
        const keys = Object.keys(fieldValue) as (keyof T)[];

        for (const key of keys) {
            const subFieldRef = getFieldRef(fieldRef, key);
            field.$fields[key] = createField(form, subFieldRef, key.toString()) as any;
        }

        Object.assign(field, field.$fields);
    }

    return field as FormField<T>;
}

function getFieldRef<T>(modelRef: Ref<T>, key: keyof T) {
    return computed({
        get: () => modelRef.value[key],
        set: v => (modelRef.value[key] = v)
    });
}
