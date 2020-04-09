import { computed, reactive, set, watch } from '@vue/composition-api';
import { writable } from 'zyme';

import { unref } from '../core';
import { normalizeErrorKey, FormErrorKey } from './formErrorExpression';
import { FormError } from './formErrorTypes';
import { toRef, createFieldCore } from './formFieldCore';
import {
    FieldOptions,
    FormField,
    FormModelBase,
    RefParam,
    SingleSelectField,
    SingleSelectOptions
} from './formFieldTypes';
import { getMeta } from './formMeta';

export type FormSubmit<T, R> = (m: NonNullable<T>) => Promise<R>;

export abstract class Form<T extends FormModelBase | null | unknown> {
    public abstract model: T;
    public abstract readonly disabled: boolean = false;

    public basicField<TKey extends keyof T, TValue extends T[TKey]>(
        key: TKey | RefParam<TKey>,
        options?: FieldOptions<TValue>
    ) {
        const field = writable(new FormField<TValue>());

        this.prepareField(field, key, options);

        return reactive(field) as FormField<TValue>;
    }

    public singleSelectField<TKey extends keyof T, TValue extends T[TKey], TItem>(
        key: TKey | RefParam<TKey>,
        options: SingleSelectOptions<TValue, TItem>
    ) {
        const field = writable(new SingleSelectField<TValue, TItem>());
        this.prepareField(field, key, options);

        const itemsRef = toRef(options.items);
        const itemValue = options.itemValue ?? (t => (t as unknown) as TValue);

        const items = computed(() => itemsRef.value ?? []);

        const selectedItem = computed(() => {
            return itemsRef.value?.find(i => itemValue(i) === field.value) ?? null;
        });

        field.items = unref(items);
        field.selectedItem = unref(selectedItem);

        if (options.autoSelectFirst != null) {
            const autoSelectFirst = toRef(options.autoSelectFirst);
            watch(selectedItem, item => {
                if (!autoSelectFirst.value) {
                    return;
                }

                if (item == null && itemsRef.value != null && itemsRef.value.length > 0) {
                    const firstItem = itemsRef.value[0];
                    field.update(itemValue(firstItem));
                }
            });
        }

        return reactive(field) as SingleSelectField<TValue, TItem>;
    }

    public rootField() {
        return createFieldCore(new FormField<T>(), {
            value: computed(() => this.model),
            disabled: computed(() => this.disabled),
            errors: computed(() => this.getErrorsForField('')),
            key: computed(() => ''),
            update: v => (this.model = v)
        });
    }

    private prepareField<TKey extends keyof T, TValue extends T[TKey]>(
        field: Writable<FormField<TValue>>,
        key: TKey | RefParam<TKey>,
        options?: FieldOptions<TValue>
    ) {
        const keyRef = toRef(key);
        const disabledRef = toRef(options?.disabled ?? false);

        const value = computed(() => (this.model as T)[keyRef.value] as TValue);
        const errors = computed(() => this.getErrorsForField(keyRef.value));
        const disabled = computed(() => disabledRef.value || this.disabled);

        const update = (v: TValue) => set(this.model, key, v);

        field.value = unref(value);
        field.errors = unref(errors);
        field.disabled = unref(disabled);
        field.key = unref(keyRef) as string | number;
        field.update = update;

        const validate = options?.validate;
        if (validate) {
            let recursiveCheck = false;

            // if validation handler was set, we want to continously calculate,
            // what is the valid value for the field
            // this trick will cause anything that is used in handler to be observed
            const validated = computed(() => validate(value.value));

            watch(validated, v => {
                if (recursiveCheck) {
                    // if was already changed by validation
                    recursiveCheck = false;
                    return;
                }

                if (v !== undefined && v !== value.value) {
                    // we mark value as valid, because setting new value
                    // will execute this watcher again, and it may fall into infinite loop
                    recursiveCheck = true;
                    update(v);
                }
            });
        }
    }

    private getErrorsForField(key: FormErrorKey) {
        const model = this.model;

        if (model != null && key != null) {
            const meta = getMeta(model as FormModelBase);
            // all error keys are normalized
            const fieldNormalized = normalizeErrorKey(key);
            const errors = meta.errors[fieldNormalized] ?? [];

            return errors.map(e => e.message);
        }

        return [] as string[];
    }
}

export abstract class FormRoot<T extends FormModelBase | null | unknown> extends Form<T> {
    public abstract readonly errors: readonly FormError[] = [];

    public abstract submit<R>(action: FormSubmit<T, R>): Promise<R>;
    public abstract setErrors(errors: FormError[]): void;
    public abstract clearErrors(): void;
}
