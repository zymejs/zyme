import { computed, ref, Ref, set } from '@vue/composition-api';

import { Form, FormModel, FormError, FormPart, FormPartOptions, FormContext } from './types';
import { reactive, unref } from '../composition';

export function useForm<T extends {}>(model: FormModel<T>): Form<T> {
    const errors = ref<FormError[]>([]);
    const parts = ref<Dictionary<FormPart[]>>({});
    const modelRef = ref(model) as Ref<T>;

    const form = reactive<Form<T>>({
        model: unref(modelRef),
        errors: unref(errors),
        parts: unref(parts),
        clearErrors() {
            //
        },
        setErrors(e: FormError[]) {
            //
        },
        createContext() {
            const formContext: FormContext<T> = {
                form: form,
                model: modelRef,
                parent: null,
                path: '',
                registerPart: registerPart
            };

            return formContext;
        }
    });

    return form;
}

function registerPart<T, K extends keyof T>(
    this: FormContext<T>,
    options: FormPartOptions<T, K>
): FormPart<T[K]> {
    const key = options.field;
    const form = this.form;
    const path = combinePaths(this.path, escapeFieldKey(key.toString()));
    const model = this.model;
    const fieldRef = computed({
        get: () => model.value[key],
        set: v => (model.value[key] = v)
    }) as Ref<T[K]>;

    const partsDict = form.parts as Dictionary<FormPart[]>;
    let partsArray = partsDict[path];
    if (!partsArray) {
        partsArray = [];
        set(partsDict, path, partsArray);
    }

    const formPart = reactive<FormPart<T[K]>>({
        model: unref(fieldRef),
        path: path,
        errors: [],
        remove() {
            const index = partsArray.indexOf(this);
            partsArray.splice(index, 1);

            // remove array of parts from the dictionary
            if (!partsArray.length) {
                set(partsDict, key, null);
            }
        }
    });

    partsArray.push(formPart);

    return formPart;
}

function combinePaths(first: string | null, second: string | null) {
    if (!first) {
        return second ?? '';
    }

    if (!second) {
        return first;
    }

    return `${first}.${second}`;
}

function escapeFieldKey(key: string | null | undefined): string {
    if (key == null) {
        return '';
    }

    return key.replace('\\', '\\\\').replace('.', '\\_');
}
