import { combineErrorExpressions, normalizeErrorKey } from './formErrorHelpers';
import { FormError } from './formErrorTypes';
import { getMeta, FormModelMetadata } from './formMeta';

export function propagateErrors<T>(expr: string, model: T | null, errors: readonly FormError[]) {
    if (!isObjectModel(model)) {
        return;
    }

    const errorsToPropagate: FormError[] = [];

    // we use dot as a separator between expression parts
    const prefix = expr ? expr + '.' : '';

    const errorsForModel: FormModelMetadata['errors'] = {};

    for (const error of errors) {
        // ignore errors that does not match the prefix
        if (error.key.startsWith(prefix) === false) {
            continue;
        }

        // trim the prefix
        const keyWithoutPrefix = error.key.substr(prefix.length);

        const propertyName = getFirstPropertyFromExpression(keyWithoutPrefix);

        let errorsForProperty = errorsForModel[propertyName];
        if (!errorsForProperty) {
            errorsForModel[propertyName] = errorsForProperty = [];
        }

        // add this error to the property
        errorsForProperty.push(error);

        // add this error to propagate it further
        errorsToPropagate.push(error);
    }

    // update errors for this model
    getMeta(model).errors = errorsForModel;

    if (Array.isArray(model)) {
        // propagate errors for items of the array
        for (let i = 0; i < model.length; i++) {
            const propKey = i.toString();
            const propExpr = combineErrorExpressions(expr, propKey);

            propagateErrors(propExpr, model[i], errorsToPropagate);
        }
    } else {
        // propagate errors for properties of the object
        for (const prop of Object.keys(model)) {
            const value = (model as any)[prop];
            const propKey = normalizeErrorKey(prop);
            const propExpr = combineErrorExpressions(expr, propKey);

            propagateErrors(propExpr, value, errorsToPropagate);
        }
    }
}

function isObjectModel(model: any): model is object {
    return model != null && model instanceof Object;
}

function getFirstPropertyFromExpression(expr: string) {
    if (!expr) {
        // empty property means the root of the object
        return '';
    }

    const nextDotIndex = expr.indexOf('.');

    if (nextDotIndex > 0) {
        // if there are more nested props, take only first
        return expr.substr(0, nextDotIndex);
    }

    // if there is no more nested props, the whole expression is a prop
    return expr;
}
