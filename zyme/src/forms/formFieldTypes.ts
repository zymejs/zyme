import { computed, reactive, set, watch, Ref } from '@vue/composition-api';
import { unref, writable } from 'zyme';

import { getErrorsForModel } from './formErrorHelpers';
import { toRef } from './formFieldCore';

export type RefParam<T> = Readonly<Ref<T>> | ((this: void) => T);
export type FormModelBase = object | any[];

export interface FieldOptions<TValue> {
    /** Is the field disabled */
    disabled?: RefParam<boolean>;

    /**
     * You can override field value
     */
    value?(value: TValue): TValue;

    /**
     * You can validate input on change and return some other value.
     */
    validate?(value: TValue): TValue | undefined;
}

export class FormField<T> {
    constructor() {
        const builder = createFieldBuilder(this);
        Object.assign(this, builder);
    }

    /** Current value of the field */
    readonly value!: T;

    /** Is the field currently disabled */
    readonly disabled!: boolean;

    /** Reactive collection of errors for this form field. */
    readonly errors!: readonly string[];

    /** Updates current value of the field */
    readonly update!: (this: void, value: T) => void;
}

export interface SingleSelectOptions<TValue, TItem = unknown> extends FieldOptions<TValue> {
    /** Items for this field */
    items: RefParam<TItem[] | null | undefined> | TItem[];

    /** Value for the field computed from item */
    itemValue?: (item: TItem) => TValue;

    /**
     * If set to true, first item will be selected,
     * once there is no matching item for the current value
     */
    autoSelectFirst?: boolean | RefParam<boolean>;
}

export class SingleSelectField<TValue, TItem> extends FormField<TValue> {
    /** Items for the field */
    readonly items!: readonly TItem[];

    /** Currently selected item */
    readonly selectedItem!: TItem | null;
}

export interface CustomFormFieldOptions<TValue> extends FieldOptions<TValue> {}

interface FormFieldBuilder<T> {
    fieldSingleSelect<TKey extends keyof T, TValue extends T[TKey], TItem>(
        key: TKey | RefParam<TKey>,
        options: SingleSelectOptions<TValue, TItem>
    ): FormFieldWrapper<SingleSelectField<TValue, TItem>>;

    fieldBasic<TKey extends keyof T, TValue extends T[TKey]>(
        key: TKey | RefParam<TKey>,
        options?: FieldOptions<TValue>
    ): FormFieldWrapper<FormField<TValue>>;
}

export type FormFieldWrapper<TField extends FormField<any>> = TField extends FormField<infer TValue>
    ? TField & FormFieldBuilder<TValue>
    : never;

function createFieldBuilder<T>(field: FormField<T>): FormFieldBuilder<T> {
    return {
        fieldBasic: (key, options) => createFieldBasic(field, key, options),
        fieldSingleSelect: (key, options) => createFieldSingleSelect(field, key, options)
    };
}

function createFieldBasic<T, TKey extends keyof T, TValue extends T[TKey]>(
    parent: FormField<T>,
    key: TKey | RefParam<TKey>,
    options?: FieldOptions<TValue>
) {
    const field = writable(new FormField<TValue>());

    prepareField(parent, field, key, options);

    return (reactive(field) as unknown) as FormFieldWrapper<FormField<TValue>>;
}

function createFieldSingleSelect<T, TKey extends keyof T, TValue extends T[TKey], TItem>(
    parent: FormField<T>,
    key: TKey | RefParam<TKey>,
    options: SingleSelectOptions<TValue, TItem>
) {
    const field = writable(new SingleSelectField<TValue, TItem>());

    prepareField(parent, field, key, options);

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

        // if auto select first was set, we may want to select first item in 2 cases:
        // - current item was nullified
        // - current item is still null, but collection changed
        // this trick will cause anything that is used in handler to be observed
        const selectedItemWithFallback = computed(() => {
            const selected = selectedItem.value;
            if (selected != null || !autoSelectFirst.value) {
                return selected;
            }

            if (itemsRef.value != null) {
                return itemsRef.value[0];
            }
        });

        watch(selectedItemWithFallback, item => {
            const selected = selectedItem.value;
            if (!selected && item) {
                // select the first item
                field.update(itemValue(item));
            }
        });
    }

    return (reactive(field) as unknown) as FormFieldWrapper<SingleSelectField<TValue, TItem>>;
}

function prepareField<T, TKey extends keyof T, TValue extends T[TKey]>(
    parent: FormField<T>,
    field: Writable<FormField<TValue>>,
    key: TKey | RefParam<TKey>,
    options?: FieldOptions<TValue>
) {
    const keyRef = toRef(key);
    const disabledRef = toRef(options?.disabled ?? false);

    const valueOverride = options?.value;
    const value = valueOverride
        ? computed(() => valueOverride((parent.value as T)[keyRef.value] as TValue))
        : computed(() => (parent.value as T)[keyRef.value] as TValue);
    const errors = computed(() => getErrorsForModel(parent.value as any, keyRef.value));
    const disabled = computed(() => disabledRef.value || parent.disabled);

    const update = (v: TValue) => {
        set(parent.value, keyRef.value, v);
    };

    field.value = unref(value);
    field.errors = unref(errors);
    field.disabled = unref(disabled);
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
