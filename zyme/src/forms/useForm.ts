import { reactive, computed } from '@vue/composition-api';

import { Form, FormModel } from './types';
import { createField } from './createField';
import { clearErrors } from './clearErrors';
import { setErrors } from './setErrors';

interface FormOptions<T> {
    model: FormModel<T>;
    submit?(): Promise<void> | void;
}

export function useForm<T extends {}>(options: FormOptions<T>): Form<T> {
    const form = (reactive(options) as unknown) as Form<T>;
    const rootRef = computed({
        get: () => form.model,
        set: v => (form.model = v)
    });
    const root = createField(form, rootRef, null);
    form.fields = root;
    form.clearErrors = () => clearErrors(root);
    form.setErrors = e => setErrors(root, e);
    return form;
}
