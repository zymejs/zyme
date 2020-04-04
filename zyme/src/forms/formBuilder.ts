import { computed, isRef, reactive, ref, set, watch, Ref } from '@vue/composition-api';

import { Form } from './form';
import { normalizeErrorKey } from './formErrorExpression';
import { getMeta } from './formMeta';

type RefParam<T> = Ref<T> | (() => T);
type ModelBase = object | any[];

interface FieldOptions<
    TModel extends ModelBase,
    TField extends keyof TModel,
    TValue extends TModel[TField] = TModel[TField]
> {
    form: Form<TModel> | RefParam<Form<TModel>>;

    /** What is the key for the model */
    field: TField | RefParam<TField>;

    /** Is the field disabled */
    disabled?: RefParam<boolean>;

    validate?(value: TValue): TValue | undefined;
}

type FieldDefaultOptions<TValue> = TValue extends null
    ? { defaultValue?: TValue | null }
    : {
          defaultValue: TValue;
      };

interface SingleSelectOptions<
    TModel extends ModelBase,
    TField extends keyof TModel,
    TValue extends TModel[TField] = TModel[TField],
    TItem = TModel[TField]
> extends FieldOptions<TModel, TField, TValue> {
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

// type SingleSelectOptions<
//     TModel extends ModelBase,
//     TField extends keyof TModel,
//     TValue extends TModel[TField] = TModel[TField],
//     TItem = TModel[TField]
// > = SingleSelectBaseOptions<TModel, TField, TValue, TItem> & FieldDefaultOptions<TModel[TField]>;

interface FormField<TValue> {
    /**
     * Current value of the field.
     * Can be read and written to
     */
    value: TValue;

    /** Form for this field */
    readonly form: Form;

    /** Model for this field */
    readonly model: object | any[];

    /** Field name */
    readonly field: string | number;

    /** Is the field currently disabled */
    readonly disabled: boolean;

    /** Reactive collection of errors for this form field. */
    readonly errors: readonly string[];
}

interface SingleSelectField<TValue, TItem> extends FormField<TValue> {
    /** Items for the field */
    readonly items: TItem[];

    /** Currently selected item */
    readonly selectedItem: TItem | null;
}

export function basicField<TModel extends ModelBase, TField extends keyof TModel>(
    options: FieldOptions<TModel, TField>
): FormField<TModel[TField]> {
    const field = coreField(options);

    return (reactive(field) as unknown) as FormField<TModel[TField]>;
}

export function singleSelect<
    TModel extends ModelBase,
    TField extends keyof TModel,
    TValue extends TModel[TField],
    TItem
>(options: SingleSelectOptions<TModel, TField, TValue, TItem>): SingleSelectField<TValue, TItem> {
    const field = coreField(options);
    const items = toRef(options.items);
    const itemValue = options.itemValue ?? (t => (t as unknown) as TValue);

    const selectedItem = computed(() => {
        return items.value?.find(i => itemValue(i) === field.value.value);
    });

    const defaultValue = options.defaultValue ?? (null as any);

    if (options.autoSelectFirst != null) {
        const autoSelectFirst = toRef(options.autoSelectFirst);
        watch(selectedItem, item => {
            if (!autoSelectFirst.value) {
                return;
            }

            if (item == null && items.value != null && items.value.length > 0) {
                const firstItem = items.value[0];
                field.value.value = itemValue(firstItem);
            } else {
                field.value.value = defaultValue;
            }
        });
    }

    const result = reactive({
        ...field,
        items,
        selectedItem
    });

    return (result as unknown) as SingleSelectField<TValue, TItem>;
}

function coreField<
    TModel extends ModelBase,
    TField extends keyof TModel,
    TValue extends TModel[TField]
>(options: FieldOptions<TModel, TField, TValue>) {
    const form = toRef(options.form);
    const model = toRef(() => form.value.model);
    const field = toRef(options.field);

    const value = computed({
        get: () => model.value[field.value] as TValue,
        set: v => set(model.value, field.value, v)
    });

    const errors = computed(() => getErrorsForField(model, field));
    const disabled = toRef(options.disabled ?? false);

    const validate = options.validate;
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
                value.value = v;
            }
        });
    }

    return {
        form,
        model,
        field,
        value,
        errors,
        disabled
    };
}

function toRef<T>(param: RefParam<T> | T): Readonly<Ref<T>> {
    if (isRef(param)) {
        return param;
    }

    if (param instanceof Function) {
        return computed(param);
    }

    return ref(param);
}

function getErrorsForField<TModel extends ModelBase, TField extends keyof TModel>(
    modelRef: Readonly<Ref<TModel>>,
    fieldRef: Readonly<Ref<TField>>
) {
    const model = modelRef.value;
    const field = fieldRef.value;

    if (model != null && field != null) {
        const meta = getMeta(model);
        // all error keys are normalized
        const fieldNormalized = normalizeErrorKey(field.toString());
        const errors = meta.errors[fieldNormalized] ?? [];

        return errors.map(e => e.message);
    }

    return [] as string[];
}
