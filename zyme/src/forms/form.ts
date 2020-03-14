import { Ref, computed, reactive, set } from '@vue/composition-api';

import { FormError, FormModel, FormPart, FormPartOptions } from './types';
import { combinePaths, escapeFieldKey } from './helpers';
import { unref, propRef } from '../composition';
import { writable } from '../utils';

export class Form<T = unknown> {
    constructor(model: FormModel<T>) {
        this.model = model;
    }

    /** Form model */
    public model: T;

    /** Reactive collection of all form errors */
    public readonly errors: ReadonlyArray<FormError> = [];

    /** Reactive collection of form components registered in the form */
    readonly parts: Readonly<Dictionary<FormPart[]>> = {};

    public readonly busy = false;

    /** Clears all errors in the form */
    public clearErrors(): void {}

    /** Sets errors for the form */
    public setErrors(errors: FormError[]): void {}

    public createContext(): FormContext<T> {
        return new FormContext({
            form: this,
            model: computed({
                get: () => this.model,
                set: m => (this.model = m)
            }),
            parent: null,
            path: ''
        });
    }
}

export class FormContext<T = unknown> {
    constructor(options: Properties<FormContext<T>>) {
        this.model = options.model;
        this.parent = options.parent;
        this.form = options.form;
        this.path = options.path;
    }

    /** Model for this form context */
    public readonly model!: Ref<T>;

    public readonly parent!: FormContext | null;

    /** Form that is the root of this context */
    public readonly form!: Form;

    /** Current path for the form context */
    public readonly path!: string;

    /** Allows registering form part components in the form */
    public registerPart<K extends keyof T>(options: FormPartOptions<T, K>): FormPart<T[K]> {
        const key = options.field;
        const form = this.form;
        const path = combinePaths(this.path, escapeFieldKey(key.toString()));
        const field = propRef(this.model, key);
        const disabled = propRef(this.form, 'busy');

        const partsDict = form.parts as Dictionary<FormPart[]>;
        let partsArray = partsDict[path];
        if (!partsArray) {
            partsArray = [];
            set(partsDict, path, partsArray);
        }

        const formPart = reactive<FormPart<T[K]>>({
            model: writable(unref(field)),
            element: unref(options.element),
            path: path,
            errors: [],
            disabled: unref(disabled),
            remove() {
                const index = partsArray.indexOf(this);
                partsArray.splice(index, 1);

                // remove array of parts from the dictionary
                if (!partsArray.length) {
                    set(partsDict, key, null);
                }
            },
            clearErrors() {
                // TODO
            }
        }) as FormPart<T[K]>;

        partsArray.push(formPart);

        return formPart;
    }
}
