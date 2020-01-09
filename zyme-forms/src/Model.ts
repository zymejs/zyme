import Vue from 'vue';

import jsepParse, * as jsep from 'jsep';

export type ModelErrorKey = string | null | undefined | number;

export interface Model extends Object {
    $errors?: ModelErrors;
    toJSON?(): object;
}

export interface ModelGeneric extends Model {
    [key: string]: any;
}

export interface ModelError {
    key: ModelErrorKey;
    message: string;
}

export interface ModelErrors {
    [key: string]: string[];
}

export function hasErrors<T extends Model>(model: T) {
    let errorsAll = model && model.$errors;
    return errorsAll != null && Object.keys(errorsAll).length > 0;
}

export function getErrorsForProp<T extends Model>(model: T, prop: ModelErrorKey): string[] {
    const errorsAll = model && model.$errors;
    const errorKey = getKey(prop);

    return (errorsAll && errorsAll[errorKey]) || [];
}

export function getErrors<T extends Model>(model: T) {
    if (!model.toJSON) {
        Object.defineProperty(model, 'toJSON', {
            configurable: false,
            enumerable: false,
            value: modelToJson
        });
    }

    return model.$errors || Vue.set(model, '$errors', {});
}

export function clearErrorsForProp<T extends Model>(model: T, prop: string | number): void {
    let errorsAll = model && model.$errors;
    if (errorsAll) {
        const errorKey = getKey(prop);
        Vue.delete(errorsAll, errorKey);
    }
}

export function clearAllErrors<T extends Model>(model: T | T[]): void {
    if (!model) {
        return;
    }

    if (Array.isArray(model)) {
        for (let item of model) {
            clearAllErrors(item);
        }
    } else {
        if (!model.$errors) {
            return;
        }

        Vue.set(model, '$errors', undefined);

        for (let prop of Object.keys(model)) {
            let value = (model as ModelGeneric)[prop];
            clearAllErrors(value);
        }
    }
}

export function setErrors<T extends Model>(model: T, errors: ModelError[]): void {
    clearAllErrors(model);

    if (errors && errors.length) {
        for (let error of errors) {
            if (error.key == null || error.key === '') {
                addErrorForKey(model, '', error.message);
            } else {
                let expression = jsepParse(error.key.toString());
                addErrorForExpression(model, expression, error.message);
            }
        }
    }
}

function addErrorForExpression(model: ModelGeneric, expr: jsep.Expression, message: string) {
    if (!expr) {
        return;
    }

    switch (expr.type) {
        case 'MemberExpression': {
            let memberExpr = expr as jsep.MemberExpression;
            let childModel = findChildModel(model, memberExpr.object);
            let propertyName: string;

            switch (memberExpr.property.type) {
                case 'Identifier': {
                    let propertyExpr = memberExpr.property as jsep.Identifier;
                    propertyName = propertyExpr.name;
                    break;
                }
                case 'Literal': {
                    let literalExpr = memberExpr.property as jsep.Literal;

                    if (Array.isArray(childModel)) {
                        childModel = childModel[literalExpr.value as any];
                        propertyName = '';
                    } else {
                        propertyName = literalExpr.value.toString();
                    }
                    break;
                }
                default:
                    throw new Error('Unknown expression type');
            }

            if (childModel) {
                addErrorForKey(childModel, propertyName, message);
            } else if (process.env.NODE_ENV !== 'production') {
                console.error(`No model value for property "${propertyName}"`, {
                    model: model
                });
            }

            return;
        }

        case 'Identifier': {
            let identifier = expr as jsep.Identifier;
            let child = getPropCaseInsensitive(model, identifier.name);

            if (child instanceof Object && !Array.isArray(child)) {
                addErrorForKey(child, '', message);
            } else {
                addErrorForKey(model, identifier.name, message);
            }

            return;
        }

        // expression like ['foo'] are treated as arrays by jsep
        case 'ArrayExpression': {
            const arrayExpr = expr as jsep.ArrayExpression;
            const indexExpr = arrayExpr.elements[0];
            if (indexExpr?.type === 'Literal') {
                const indexLiteral = indexExpr as jsep.Literal;
                const indexValue = indexLiteral.value?.toString();

                addErrorForKey(model, indexValue, message);
            }

            return;
        }
    }
}

function addErrorForKey(model: ModelGeneric, key: ModelErrorKey, message: string) {
    const errors = getErrors(model);
    const errorKey = getKey(key);
    const forKey = errors[errorKey] || Vue.set(errors, errorKey, []);

    forKey.push(message);
}

function findChildModel(
    model: ModelGeneric | undefined,
    expr: jsep.Expression
): ModelGeneric | undefined {
    if (!expr || !model) {
        return undefined;
    }

    switch (expr.type) {
        case 'Identifier': {
            const identifier = expr as jsep.Identifier;

            return getPropCaseInsensitive(model, identifier.name);
        }
        case 'MemberExpression': {
            let memberExpr = expr as jsep.MemberExpression;
            let childModel = findChildModel(model, memberExpr.object);

            return findChildModel(childModel, memberExpr.property);
        }
        case 'Literal': {
            let literalExpr = expr as jsep.Literal;
            let childModel = model[literalExpr.value as any];

            return childModel;
        }
    }
}

function getPropCaseInsensitive(model: ModelGeneric, prop: string) {
    const errorKey = getKey(prop);

    for (let key of Object.keys(model)) {
        if (errorKey === getKey(key)) {
            return model[key];
        }
    }
}

function getKey(key: ModelErrorKey) {
    if (key == null) {
        key = '';
    }
    return key.toString().toLowerCase();
}

function modelToJson(this: ModelGeneric): any {
    if (this instanceof Object === false) {
        return this;
    }

    if (Array.isArray(this)) {
        return this.map(x => modelToJson.apply(x));
    }

    const clone = {} as ModelGeneric;
    for (let key of Object.keys(this)) {
        if (key !== '$errors') {
            clone[key] = modelToJson.apply(this[key]);
        }
    }

    return clone;
}
