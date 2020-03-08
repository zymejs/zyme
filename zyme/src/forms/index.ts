import { reactive, Ref, computed } from '@vue/composition-api';

type FormModelObject<T extends {}> = { [P in keyof T]-?: FormModelType<T[P]> };

interface FormModelArrayLike<T> {
    readonly length: number;
    readonly [n: number]: FormModelType<T>;
}

type FormModelArray<T> = FormModelArrayLike<T> & Pick<T[], keyof T[]>;

type FormModelAny<T> = T extends string
    ? T // tslint:disable-next-line: ban-types
    : T extends Function
    ? T
    : T extends any[]
    ? FormModelArray<ArrayItem<T>>
    : T extends ArrayLike<any>
    ? FormModelArrayLike<ArrayItem<T>>
    : T extends object
    ? FormModelObject<T>
    : Exclude<T, undefined>;

type FormModelType<T> = T extends FormModelAny<T> ? T : never;

interface FormFieldBase<T> {
    $get(): T;
    $set(value: T): void;
    $errors: string[];
}

type FormField<T> = T extends string | number | boolean | null
    ? FormFieldBase<T>
    : FormFieldBase<T> & FormFieldCollection<T>;

type FormFieldCollection<T> = {
    readonly [P in keyof T]: FormField<T[P]>;
};

interface FormModelBase {
    [key: string]: any;
}

export interface FormModel<T> {
    fields: FormFieldCollection<T>;
    value: T;
}

export function formModel<T extends {}>(model: FormModelType<T>): FormModel<T> {
    const fields = {} as FormFieldCollection<T>;

    const value = reactive(model) as T;
    const keys = Object.keys(model) as (keyof T)[];

    for (const key of keys) {
        const field = {} as FormField<T[keyof T]>;

        Object.defineProperty(field, 'value', {
            get: () => value[key],
            set: v => (value[key] = v)
        });
    }

    return {
        fields,
        value
    };
}

interface Foobar {
    foo: string;
    asd: number;
    wer: boolean;
    bar: string | null;
    ert: { b: boolean };
}
