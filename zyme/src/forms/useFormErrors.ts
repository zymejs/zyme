import { computed, Ref } from '@vue/composition-api';

import { getErrorsForModel } from './formErrorHelpers';
import { toRef } from './formFieldCore';
import { FormModelBase, RefParam } from './formFieldTypes';

type ErrorsRef = Readonly<Ref<readonly string[]>>;

export function useFormErrors<T extends FormModelBase>(model: RefParam<T>): ErrorsRef;
export function useFormErrors<T extends FormModelBase>(
    model: RefParam<T>,
    key: keyof T | RefParam<keyof T>
): ErrorsRef;
export function useFormErrors<T extends FormModelBase>(
    model: RefParam<T>,
    key?: keyof T | RefParam<keyof T>
) {
    const keyRef = toRef(key);
    const modelRef = toRef(model);

    return computed(() => getErrorsForModel(modelRef.value, keyRef.value));
}
