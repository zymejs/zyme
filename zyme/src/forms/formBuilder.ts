import { computed, isRef, reactive, ref, set, watch, Ref } from '@vue/composition-api';

import { Form } from './form';
import { normalizeErrorKey } from './formErrorExpression';
import { getMeta } from './formMeta';

type RefParam<T> = Readonly<Ref<T>> | ((this: void) => T);
type ModelBase = object | any[];

export interface FieldOptions<
    TModel extends ModelBase,
    TField extends keyof TModel,
    TValue extends TModel[TField] = TModel[TField]
> {
    parent: Form<TModel> | RefParam<Form<TModel> | FormField<TModel>>;

    /** What is the key for the model */
    field: TField | RefParam<TField>;

    /** Is the field disabled */
    disabled?: RefParam<boolean>;

    validate?(value: TValue): TValue | undefined;
}

export interface SingleSelectOptions<
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

export interface DummyFieldOptions<TValue> {
    disabled?: RefParam<boolean>;
    value: RefParam<TValue>;
}

// tslint:disable-next-line: ban-types
export interface FormField<TValue = unknown, TMeta = undefined> {
    /** Current value of the field */
    readonly value: TValue;

    /** Form for this field */
    readonly form: Form | null;

    /** Model for this field */
    readonly model: object | any[] | null;

    /** Field name */
    readonly field: string | number | null;

    /** Is the field currently disabled */
    readonly disabled: boolean;

    /** Reactive collection of errors for this form field. */
    readonly errors: readonly string[];

    readonly meta: TMeta;

    /** Updates current value of the field */
    update(this: void, value: TValue): void;
}

export interface SingleSelectFieldMeta<TItem> {
    /** Items for the field */
    readonly items: TItem[];

    /** Currently selected item */
    readonly selectedItem: TItem | null;
}

export interface SingleSelectField<TValue, TItem>
    extends FormField<TValue, SingleSelectFieldMeta<TItem>> {
    /** Items for the field */
    readonly items: TItem[];

    /** Currently selected item */
    readonly selectedItem: TItem | null;
}

export function dummyField<TValue>(options: DummyFieldOptions<TValue>): FormField<TValue> {
    const fieldRefs: FormFieldRefs<FormField<TValue>> = {
        value: toRef(options.value),
        disabled: toRef(options.disabled ?? false),
        errors: ref([]),
        field: ref(undefined),
        form: ref(undefined),
        model: ref(undefined),
        meta: ref(undefined),
        update: v => void 0
    };

    return reactive(fieldRefs) as FormField<TValue>;
}

export function basicField<TModel extends ModelBase, TField extends keyof TModel>(
    options: FieldOptions<TModel, TField>
): FormField<TModel[TField]> {
    const fieldCore = coreField(options);
    const field = reactive(fieldCore) as FormField<TModel[TField]>;

    return field;
}

export function singleSelect<
    TModel extends ModelBase,
    TField extends keyof TModel,
    TValue extends TModel[TField],
    TItem
>(options: SingleSelectOptions<TModel, TField, TValue, TItem>): SingleSelectField<TValue, TItem> {
    const fieldCore = coreField(options);
    const items = toRef(options.items);
    const itemValue = options.itemValue ?? (t => (t as unknown) as TValue);

    const selectedItem = computed(() => {
        return items.value?.find(i => itemValue(i) === fieldCore.value.value);
    });

    // const defaultValue = options.defaultValue ?? (null as any);

    if (options.autoSelectFirst != null) {
        const autoSelectFirst = toRef(options.autoSelectFirst);
        watch(selectedItem, item => {
            if (!autoSelectFirst.value) {
                return;
            }

            if (item == null && items.value != null && items.value.length > 0) {
                const firstItem = items.value[0];
                fieldCore.update(itemValue(firstItem));
            }
        });
    }

    const fieldRefs = {
        ...fieldCore,
        items,
        selectedItem,
        meta: {
            items,
            selectedItem
        }
    };

    const field = reactive(fieldRefs) as SingleSelectField<TValue, TItem>;

    return field;
}

type FormFieldProxyOptions2<TValue, TField extends FormField<TValue>> = {
    [K in keyof TField]: K extends 'value'
        ? FormFieldPropProxy<TValue>
        : TField[K] extends (arg: infer P) => void
        ? FormFieldMethodProxy<P>
        : FormFieldPropProxy<TField[K]>;
};

type FormFieldPropProxy<T> = (this: void, value: T) => T;
type FormFieldMethodProxy<T> = (this: void, arg: T) => T;

type FormFieldRefs<TField extends FormField> = {
    // tslint:disable-next-line: ban-types
    [K in keyof TField]: K extends 'value'
        ? Readonly<Ref<TField[K]>>
        : TField[K] extends (arg: infer P) => void
        ? (arg: P) => void
        : Readonly<Ref<TField[K]>>;
};

type FormFieldProxyOptions<TValue> = {
    [K in keyof FormField<TValue>]: K extends 'value'
        ? RefParam<FormField<TValue>[K]> // tslint:disable-next-line: ban-types
        : FormField<TValue>[K] extends Function
        ? FormField<TValue>[K]
        : RefParam<FormField<TValue>[K]>;
};

export function fieldProxy<TValue>(options: FormFieldProxyOptions<TValue>) {
    const fieldRefs: FormFieldRefs<FormField<TValue>> = {
        value: toRef(options.value),
        disabled: toRef(options.disabled),
        errors: toRef(options.errors),
        field: toRef(options.field),
        form: toRef(options.form),
        meta: toRef(options.meta),
        model: toRef(options.model),
        update: options.update
    };

    return reactive(fieldRefs) as FormField<TValue>;
}

// export function fieldProxy<TValue, TField extends FormField<TValue>>(
//     field: RefParam<TField> | TField,
//     options: FormFieldProxyOptions<TValue, TField>
// ): TField {
//     const fieldRef = toRef(field);

//     const result: FormFieldRefs<FormField<TValue>> = {
//         value: getPropProxy(fieldRef, options, 'value'),
//         disabled: getPropProxy(fieldRef, options, 'disabled'),
//         errors: getPropProxy(fieldRef, options, 'errors'),
//         field: getPropProxy(fieldRef, options, 'field'),
//         form: getPropProxy(fieldRef, options, 'form'),
//         model: getPropProxy(fieldRef, options, 'model'),
//         meta: computed(() => fieldRef.value.meta),
//         update: getMethodProxy(fieldRef, options, 'update')
//     };

//     return reactive(result) as TField;
// }

// function getPropProxy<TValue, TField extends FormField<TValue>, K extends keyof TField>(
//     field: Ref<TField>,
//     options: FormFieldProxyOptions<TValue, TField>,
//     prop: K
// ): Readonly<Ref<TField[K]>> {
//     const proxy = options[prop] as FormFieldPropProxy<TField[K]> | undefined;
//     if (!proxy) {
//         return computed(() => field.value[prop]) as Readonly<Ref<TField[K]>>;
//     }

//     return computed(() => proxy(field.value[prop])) as Readonly<Ref<TField[K]>>;
// }

// function getMethodProxy<TValue, TField extends FormField<TValue>, K extends keyof TField>(
//     field: Ref<TField>,
//     options: FormFieldProxyOptions<TValue, TField>,
//     prop: K
// ): (arg: TField[K]) => void {
//     const proxy = options[prop] as FormFieldMethodProxy<TField[K]> | undefined;
//     if (!proxy) {
//         return a => {
//             if()
//             field.value[prop](a);
//         }
//     }

//     return computed(() => proxy(field.value[prop])) as Readonly<Ref<TField[K]>>;
// }

// function getValueProxy<TValue, TField extends FormField<TValue>>(
//     field: Ref<TField>,
//     proxy: FormFieldValueProxy<TValue> | undefined
// ): Ref<TValue> {
//     if (!proxy) {
//         return computed({
//             get: () => field.value.value,
//             set: v => (field.value.value = v)
//         });
//     }

//     let getValue: () => TValue;
//     let setValue: (value: TValue) => void;

//     if (proxy instanceof Function) {
//         getValue = () => proxy(field.value.value);
//         setValue = v => (field.value.value = v);
//     } else {
//         const getProxy = proxy.get;
//         if (getProxy) {
//             getValue = () => getProxy(field.value.value);
//         } else {
//             getValue = () => field.value.value;
//         }

//         const setProxy = proxy.set;
//         if (setProxy) {
//             setValue = v => (field.value.value = setProxy(v));
//         } else {
//             setValue = v => (field.value.value = v);
//         }
//     }

//     return computed({
//         get: getValue,
//         set: setValue
//     });
// }

function coreField<
    TModel extends ModelBase,
    TField extends keyof TModel,
    TValue extends TModel[TField]
>(options: FieldOptions<TModel, TField, TValue>): FormFieldRefs<FormField<TValue>> {
    const parent = toRef(options.parent);

    const model = toRef(() => {
        const parentValue = parent.value;
        if (parentValue instanceof Form) {
            return parentValue.model;
        }

        return parentValue.value;
    });

    const form = toRef(() => {
        const parentValue = parent.value;
        if (parentValue instanceof Form) {
            return parentValue;
        }

        return parentValue.form;
    });

    const field = toRef(options.field);

    const value = computed(() => model.value[field.value] as TValue);

    const update = (v: TValue) => set(model.value, field.value, v);

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
                update(v);
            }
        });
    }

    return {
        form,
        model,
        field: field as Ref<string | number>,
        value,
        errors,
        disabled,
        meta: ref(undefined),
        update
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
