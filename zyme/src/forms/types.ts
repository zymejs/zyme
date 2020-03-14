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
    ? never
    : T extends any[]
    ? FormModelArray<ArrayItem<T>>
    : T extends ArrayLike<any>
    ? FormModelArrayLike<ArrayItem<T>>
    : T extends {}
    ? FormModelObject<T>
    : Exclude<T, undefined>;

export type FormModel<T> = T extends FormModelAny<T> ? T : never;

export interface FormPart<T = unknown> {
    /**
     * Form model for this part.
     * Can be read end written to.
     */
    model: T;

    readonly element: HTMLElement | Vue | null;

    /** Full path to the form part */
    readonly path: string;

    /**
     * Reactive collection of errors for this form part.
     */
    readonly errors: ReadonlyArray<string>;

    readonly disabled: boolean;

    /**
     * Removes form part from the context.
     * Needs be called when form part component is unmounted,
     * or form part needs to be changed (for example model key changes).
     */
    remove(): void;

    /** Clears errors for this form part */
    clearErrors(): void;
}

export interface FormPartOptions<T, K extends keyof T> {
    /**
     * Html element to be used as a form part.
     * It allows to automatically scroll to first visible errors.
     */
    readonly element: Ref<HTMLElement | Vue | null>;

    /** Field of the model for this part to be bound to */
    readonly field: K;

    /**
     * If set to true, form part will mark errors as handled.
     * Handled errors are not propagated down the form.
     * You don't want to handle errors if form part is for example error summary.
     */
    readonly handleErrors: boolean;
}

export type FormModelErrorKey = string | null | undefined | number;

export interface FormError {
    key: FormModelErrorKey;
    message: string;
}
