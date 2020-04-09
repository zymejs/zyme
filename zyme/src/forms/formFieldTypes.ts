import { Ref } from '@vue/composition-api';

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

export class FormField<TValue> {
    /** Current value of the field */
    readonly value!: TValue;

    /** Is the field currently disabled */
    readonly disabled!: boolean;

    /** Reactive collection of errors for this form field. */
    readonly errors!: readonly string[];

    /** Updates current value of the field */
    readonly update!: (this: void, value: TValue) => void;
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
