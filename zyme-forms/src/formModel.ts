type FormModelObject<T extends {}> = { [P in keyof T]-?: FormValue<T[P]> };

interface FormModelArrayLike<T> {
    readonly length: number;
    readonly [n: number]: FormValue<T>;
}

type FormModelArray<T> = FormModelArrayLike<T> & Pick<T[], keyof T[]>;

type FormValueCheck<T> = T extends string
    ? string // tslint:disable-next-line: ban-types
    : T extends Function
    ? never
    : T extends any[]
    ? FormModelArray<ArrayItem<T>>
    : T extends ArrayLike<any>
    ? FormModelArrayLike<ArrayItem<T>>
    : T extends object
    ? FormModelObject<T>
    : Exclude<T, undefined>;

type FormModelCheck<T> = T extends string
    ? never // tslint:disable-next-line: ban-types
    : T extends Function
    ? never
    : T extends any[]
    ? FormModelArray<ArrayItem<T>>
    : T extends ArrayLike<any>
    ? FormModelArrayLike<ArrayItem<T>>
    : T extends object
    ? FormModelObject<T>
    : never;

export type FormValue<T> = T extends FormValueCheck<T> ? T : never;

export type FormModel<T> = T extends FormModelCheck<T> ? T : never;
