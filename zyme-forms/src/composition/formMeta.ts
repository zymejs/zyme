import { reactive } from 'zyme';

import { FormError } from './formErrors';

const modelMetadataSymbol = Symbol('FormModelMetadata');

export interface FormModelMetadata {
    errors: { [key: string]: FormError[] };
}

export function getMeta(model: object) {
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
