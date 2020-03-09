import jsepParse, * as jsep from 'jsep';

import { FormField, FormModelError, FormModelErrorKey } from './types';
import { clearErrors } from './clearErrors';

export function setErrors<T>(field: FormField<T>, errors: FormModelError[]) {
    clearErrors(field);

    if (errors && errors.length) {
        for (let error of errors) {
            if (error.key == null || error.key === '') {
                field.$errors.push(error.message);
                continue;
            }

            const expression = jsepParse(error.key.toString());
            if (expression) {
                addErrorForExpression(field, expression, error.message);
            }
        }
    }
}

function addErrorForProp<T>(field: FormField<T>, prop: keyof T, message: string) {
    const propField = field.$fields[prop];
    if (propField) {
        propField.$errors.push(message);
    } else {
        field.$errors.push(message);
    }
}

function addErrorForExpression<T>(field: FormField<T>, expr: jsep.Expression, message: string) {
    switch (expr.type) {
        case 'MemberExpression': {
            let memberExpr = expr as jsep.MemberExpression;
            let childModel = findChildField(field, memberExpr.object);
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
                addErrorForProp(childModel, propertyName, message);
            }

            return;
        }

        case 'Identifier': {
            let identifier = expr as jsep.Identifier;
            let child = getFieldCaseInsensitive(field, identifier.name);

            if (child instanceof Object && !Array.isArray(child)) {
                child.$errors.push(message);
            } else {
                addErrorForProp(field, identifier.name as keyof T, message);
            }

            return;
        }
    }
}

function findChildField(
    field?: FormField<any>,
    expr?: jsep.Expression
): FormField<any> | undefined {
    if (!expr || !field) {
        return undefined;
    }

    switch (expr.type) {
        case 'Identifier': {
            const identifier = expr as jsep.Identifier;

            return getFieldCaseInsensitive(field, identifier.name);
        }
        case 'MemberExpression': {
            const memberExpr = expr as jsep.MemberExpression;
            const childModel = findChildField(field, memberExpr.object);

            return findChildField(childModel, memberExpr.property);
        }
        case 'Literal': {
            const literalExpr = expr as jsep.Literal;
            const childField = field.$fields[literalExpr.value as any];

            return childField;
        }
    }
}

function getFieldCaseInsensitive(field: FormField<any>, prop: string) {
    const errorKey = getKey(prop);
    const fields = field.$fields;

    for (let key of Object.keys(fields)) {
        if (errorKey === getKey(key)) {
            return fields[key];
        }
    }
}

function getKey(key: FormModelErrorKey) {
    if (key == null) {
        key = '';
    }

    return key.toString().toLowerCase();
}
