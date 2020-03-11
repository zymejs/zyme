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

export interface FormPart<T = unknown> {
    /**
     * Form model for this part.
     * Can be read end written to.
     */
    readonly model: T;

    /** Full path to the form part */
    readonly path: string;

    /**
     * Reactive collection of errors for this form part.
     */
    readonly errors: ReadonlyArray<string>;

    /**
     * Removes form part from the context.
     * Needs be called when form part component is unmounted,
     * or form part needs to be changed (for example model key changes).
     */
    remove(): void;
}

export interface FormPartOptions<T, K extends keyof T> {
    /**
     * Html element to be used as a form part.
     * It allows to automatically scroll to first visible errors.
     */
    element: HTMLElement;

    /** Field of the model for this part to be bound to */
    field: K;

    /**
     * If set to true, form part will mark errors as handled.
     * Handled errors are not propagated down the form.
     * You don't want to handle errors if form part is for example error summary.
     */
    handleErrors: boolean;
}

export interface FormContext<T = unknown> {
    /** Model for this form context */
    readonly model: Ref<T>;

    readonly parent: FormContext | null;

    /** Form that is the root of this context */
    readonly form: Form;

    /** Current path for the form context */
    readonly path: string;

    /** Allows registering form part components in the form */
    registerPart<K extends keyof T>(options: FormPartOptions<T, K>): FormPart<T[K]>;
}

export interface Form<T = unknown> {
    /** Form model */
    model: T;

    /** Reactive collection of all form errors */
    readonly errors: ReadonlyArray<FormError>;

    /** Reactive collection of form components registered in the form */
    readonly parts: Dictionary<FormPart[]>;

    /** Clears all errors in the form */
    clearErrors(): void;

    /** Sets errors for the form */
    setErrors(errors: FormError[]): void;

    createContext(): FormContext<T>;
}

export type FormModelErrorKey = string | null | undefined | number;

export interface FormError {
    key: FormModelErrorKey;
    message: string;
}
