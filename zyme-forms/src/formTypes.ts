import { FormError } from './formErrorTypes';
import { FormField, FormModelBase } from './formFieldTypes';

export type FormSubmit<T, R> = (m: NonNullable<T>) => Promise<R>;

export abstract class Form<T extends FormModelBase> extends FormField<T> {
    public abstract readonly allErrors: readonly FormError[];

    /** Used by form fields to know, that submit was made. */
    public abstract readonly submitCount: number;

    public abstract submit<R>(action: FormSubmit<T, R>): Promise<R>;
    public abstract setErrors(errors: FormError[]): void;
    public abstract clearErrors(): void;
}
