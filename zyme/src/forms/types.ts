import { Ref } from '@vue/composition-api';

type FormModelObject<T extends {}> = { [P in keyof T]-?: FormModel<T[P]> };

interface FormModelArrayLike<T> {
    readonly length: number;
    readonly [n: number]: FormModel<T>;
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

export type FormModel<T> = T extends FormModelAny<T> ? T : never;

export interface FormFieldSimple<T> {
    readonly $name: string | null;
    readonly $errors: string[];
    readonly $ref: Ref<T>;
    readonly $fields: FormFieldCollection<T>;
    readonly $form: Form<unknown>;
    $clearErrors(): void;
}

export type FormFieldComplex<T> = FormFieldSimple<T> & FormFieldCollection<T>;

export type FormFieldCollection<T> = {
    [P in keyof T]: FormField<T[P]>;
};

export type FormField<T> = T extends string | number | boolean | null
    ? FormFieldSimple<T>
    : FormFieldComplex<T>;

export interface Form<T = unknown> {
    fields: FormField<T>;
    model: T;
    clearErrors(): void;
    setErrors(errors: FormModelError[]): void;
}

export type FormModelErrorKey = string | null | undefined | number;

export interface FormModelError {
    key: FormModelErrorKey;
    message: string;
}
