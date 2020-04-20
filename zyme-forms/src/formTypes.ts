import { FormError } from './formErrorTypes';
import { FormField, FormModelBase } from './formFieldTypes';

export type FormSubmit<T, R> = (m: NonNullable<T>) => Promise<R>;

export abstract class Form<T extends FormModelBase> extends FormField<T> {
    public abstract readonly allErrors: readonly FormError[] = [];

    public abstract submit<R>(action: FormSubmit<T, R>): Promise<R>;
    public abstract setErrors(errors: FormError[]): void;
    public abstract clearErrors(): void;
}
