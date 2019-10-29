import Vue from 'vue';

export interface FieldsetConfig<TModel extends object> {
    fields?: FormFields<TModel>;
}

export interface FormConfig<TModel extends object> {
    model: FormModel<TModel>;
    fields?: FormFields<TModel>;
}

type FormModelObject<T extends {}> = { [P in keyof T]-?: FormModel<T[P]> };

interface FormModelArrayLike<T> {
    readonly length: number;
    readonly [n: number]: FormModel<T>;
}

type FormModelArray<T> = FormModelArrayLike<T> & Pick<T[], keyof T[]>;

type FormModelAny<T> = T extends string
    ? T // tslint:disable-next-line: ban-types
    : T extends Function
    ? T
    : T extends any[]
    ? FormModelArray<ArrayItem<T>>
    : T extends ArrayLike<any>
    ? FormModelArrayLike<ArrayItem<T>>
    : T extends object
    ? FormModelObject<T>
    : Exclude<T, undefined>;

type FormModel<T> = T extends FormModelAny<T> ? T : never;

export class Form<TModel extends object> {
    public readonly model: TModel;
    public readonly fields: FormFields<TModel>;

    private readonly handles: Dictionary<Array<FormFieldHandle<TModel[keyof TModel]>>> = {};

    constructor(config: FormConfig<TModel>) {
        this.model = config.model as TModel;
        this.fields = config.fields || {};
        configFields(this.fields, () => this.model);
    }

    public registerField<K extends keyof TModel & string>(key: K): FormFieldHandle<TModel[K]> {
        let handle = this.createHandle(key);
        let handles = this.handles[key];
        if (handles) {
            handles.push(handle);
        } else {
            Vue.set(this.handles, key, [handle]);
        }

        return handle;
    }

    private createHandle<K extends keyof TModel & string>(key: K): FormFieldHandle<TModel[K]> {
        let handle: Partial<FormFieldHandle<TModel[K]>> = {
            key: key.toString(),
            dispose: () => {
                const handles = this.handles[key];
                if (handles) {
                    const index = handles.indexOf(handle as FormFieldHandle<TModel[K]>);
                    handles.splice(index, 1);
                }

                if (handles.length === 0) {
                    Vue.delete(this.handles, key);
                }
            }
        };

        Object.defineProperty(handle, 'value', {
            get: () => {
                const model = this.model;
                return model && model[key];
            },
            set: value => {
                const model = this.model;
                return model && Vue.set(model, key, value);
            }
        });

        return handle as FormFieldHandle<TModel[K]>;
    }
}

type FormFields<TModel> = { readonly [P in keyof TModel]?: FormField<TModel[P]> };

export interface FormFieldHandle<T> {
    value: T;
    readonly key: string;
    dispose(): void;
}

export type FieldConfig<TConfig> = {
    readonly [P in keyof TConfig]: TConfig[P] | (() => TConfig[P])
};

export interface FormFieldConfig {
    readonly disabled?: boolean;
}

export class FormField<T, TConfig extends FormFieldConfig = FormFieldConfig>
    implements FormFieldConfig {
    constructor(config?: FieldConfig<TConfig>) {
        if (config) {
            for (let k of Object.keys(config)) {
                const value = config[k];

                if (typeof value === 'function') {
                    Object.defineProperty(this, k, {
                        get: value as any,
                        writable: false
                    });
                } else {
                    Object.defineProperty(this, k, {
                        value: value,
                        writable: false
                    });
                }
            }
        }
    }

    public value!: T;
    public readonly key!: string;
    public readonly disabled?: boolean;

    public $init?(): void;
}

export interface NumberFieldConfig extends FormFieldConfig {
    readonly min?: number;
    readonly max?: number;
}

export class NumberField extends FormField<number, NumberFieldConfig> implements NumberFieldConfig {
    public readonly min?: number;
    public readonly max?: number;
}

export class StringField extends FormField<string> {}

export class ObjectField<T extends object> extends FormField<T> {
    public readonly fields: FormFields<T>;

    constructor(config: FieldsetConfig<T>) {
        super();

        this.fields = config.fields || {};
    }

    public $init() {
        configFields(this.fields, () => this.value, this.key);
    }
}

export class DictionaryField<T> extends FormField<Dictionary<T>> {}

function configFields<T extends object>(
    fields: FormFields<T>,
    getter: () => T | undefined,
    keyPrefix?: string
) {
    for (let fieldName of Object.keys(fields)) {
        const field = fields[fieldName];

        if (field) {
            Object.defineProperty(field, 'value', {
                get: () => {
                    const model = getter();
                    return model && model[fieldName];
                },
                set: value => {
                    const model = getter();
                    return model && Vue.set(model, fieldName, value);
                }
            });

            Object.defineProperty(field, 'key', {
                value: keyPrefix ? keyPrefix + '.' + fieldName : fieldName,
                writable: false
            });

            if (field.$init) {
                field.$init();
            }
        }
    }
}

interface Foobar {
    name: string;
    age: number | null;
    asd: number;
}

interface Goobar {
    age: number;
    name: string | null;
    foo: Foobar;
    values: Dictionary<Foobar>;
}

let form: Form<Goobar> = new Form<Goobar>({
    model: {
        age: 123,
        name: null,
        foo: {
            age: null,
            name: 'asd',
            asd: 123
        },
        values: {}
    },
    fields: {
        age: new NumberField({
            disabled: () => form.model.name == null,
            min: 10
        }),
        name: new StringField(),
        foo: new ObjectField<Foobar>({
            fields: {
                age: new NumberField(),
                name: new StringField()
            }
        }),
        agreements: new DictionaryField<boolean>({
            field: new BoolField()
        })
    }
});
