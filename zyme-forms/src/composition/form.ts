import { ref, Ref } from '@vue/composition-api';
import { reactive, unref } from 'zyme';

import { FormModel } from './formModel';
import { FormContext, createFormContext } from './formContext';

export interface Form<T = unknown> {
    model: T;
    submit<R>(action: (m: T) => Promise<R>): Promise<R>;
    context: FormContext<T>;
}

type FormModelInit<T> = {
    [K in keyof FormModel<T>]: FormModelInit<T>[K] | Ref<FormModel<T>[K]>;
};

export function createForm<T extends {}>(model: FormModelInit<T>): Form<T>;
export function createForm<T extends {}>(model: null): Form<T | null>;
export function createForm<T extends {} | null>(model: FormModelInit<T>): Form<T>;
export function createForm<T extends {} | null>(model: FormModelInit<T> | null): Form<T> {
    const modelRef = ref(model) as Ref<FormModel<T>>;

    const form = reactive<Form<T>>({
        model: unref(modelRef),
        async submit(action) {
            return action(modelRef.value);
        },
        context: createFormContext(modelRef)
    });

    return form;
}

interface Foobar {
    readonly foo: string;
    bar: { e: string };
}

function test() {
    const foo: Foobar = {
        foo: 'asd',
        bar: {
            e: 'asd'
        }
    };

    type z = FormModelInit<Foobar>;

    const asd = ref('asd');

    const z = createForm<Foobar>({
        foo: asd,
        bar: {
            e: 'asd'
        }
    });
}
