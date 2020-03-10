import { computed, ref, Ref } from '@vue/composition-api';

import { Form, FormModel, FormError, FormPart, FormPartOptions, FormContext } from './types';
import { createField } from './createField';
import { clearErrors } from './clearErrors';
import { setErrors } from './setErrors';
import { reactive, unref } from '../composition';

export function useForm<T extends {}>(model: FormModel<T>): Form<T> {
    const errors = ref<FormError[]>([]);
    const parts = ref<FormPart[]>([]);
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
        }
    });

    const formContext: FormContext<T> = {
        form: form,
        model: modelRef,
        parent: null,
        path: '',
        registerPart: registerPart
    };

    const rootRef = computed({
        get: () => form.model,
        set: v => (form.model = v)
    });
    const root = createField(form, rootRef, null);
    form.clearErrors = () => clearErrors(root);
    form.setErrors = e => setErrors(root, e);

    return form;
}

function registerPart<T, K extends keyof T>(
    this: FormContext<T>,
    options: FormPartOptions<T, K>
): FormPart<T[K]> {
    const key = options.field;
    const form = this.form;
    const path = combinePaths(this.path, options.field.toString());
    const model = this.model;
    const fieldRef = computed({
        get: () => model.value[key],
        set: v => (model.value[key] = v)
    });

    return {
        model: fieldRef as Ref<T[K]>,
        path: path,
        errors: [] as string[],
        remove() {
            const parts = form.parts as FormPart[];
            const index = parts.indexOf(this);
            parts.splice(index, 1);
        }
    };
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
