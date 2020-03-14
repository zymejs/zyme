import { reactive } from 'zyme';

import { FormModel } from './formModel';

const modelMetadataSymbol = Symbol('FormModelMetadata');

export interface FormModelMetadata {
    errors: { [key: string]: string[] };
}

export function getMeta<T>(model: FormModel<T>) {
    model = model as any;
    let meta = (model as any)[modelMetadataSymbol] as FormModelMetadata | undefined;
    if (!meta) {
        meta = reactive({
            errors: {}
        });

        (model as any)[modelMetadataSymbol] = meta;
    }

    return meta;
}
