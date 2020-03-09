import { FormField, FormFieldSimple } from './types';

export function clearErrors<T>(field: FormField<T> | FormFieldSimple<T>) {
    field.$errors.length = 0;
    const keys = Object.keys(field.$fields) as (keyof T)[];
    for (const key of keys) {
        clearErrors(field.$fields[key] as FormField<any>);
    }
}
