import { reactive } from '../core';
import { FormField, FormModelBase } from './formFieldTypes';
import { Form } from './formTypes';

export function useForm<T extends FormModelBase>(field: () => FormField<T>) {
    const form = new FormChild<T>(field);
    return (reactive(form) as unknown) as Form<T>;
}

class FormChild<T extends FormModelBase | null> extends Form<T> {
    constructor(private readonly field: () => FormField<T>) {
        super();
    }

    public get model(): T {
        return this.field().value;
    }

    public set model(value: T) {
        this.field().update(value);
    }

    public get disabled(): boolean {
        return this.field().disabled;
    }
}
