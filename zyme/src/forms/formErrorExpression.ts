import jsepParse, * as jsep from 'jsep';

export function normalizeErrorExpression(key: string | null | undefined) {
    if (key == null || key === '') {
        return '';
    }

    const expr = jsepParse(key);
    const result = flattenExpression(expr);

    return result;
}

export function normalizeErrorKey(key: string | number | boolean | null | undefined) {
    key = key?.toString() ?? '';

    return (
        key
            // escape the escape char to avoid ambiguity
            .replace('\\', '\\\\')
            // escape dot, because we use it as separator
            .replace('.', '\\_')
            // make it lowercase so it's compatible with PascalCase backend
            .toLowerCase()
    );
}

export function combineErrorExpressions(first: string | null, second: string | null) {
    if (!first) {
        return second ?? '';
    }

    if (!second) {
        return first;
    }

    return `${first}.${second}`;
}

function flattenExpression(expr: jsep.Expression): string {
    if (!expr) {
        return '';
    }

    switch (expr.type) {
        // this matches expressions like foo.bar, where foo is object and bar is property
        case 'MemberExpression': {
            const memberExpr = expr as jsep.MemberExpression;
            const objectExpr = flattenExpression(memberExpr.object);
            const propertyExpr = flattenExpression(memberExpr.property);

            return combineErrorExpressions(objectExpr, propertyExpr);
        }

        // this matches expressions like foo, because jsep assumes its accessing some variable
        case 'Identifier': {
            const identifier = expr as jsep.Identifier;
            return normalizeErrorKey(identifier.name);
        }

        // expression like ['foo'] are treated as arrays by jsep
        case 'ArrayExpression': {
            const arrayExpr = expr as jsep.ArrayExpression;
            const indexExpr = arrayExpr.elements[0];
            if (indexExpr?.type === 'Literal') {
                const literal = indexExpr as jsep.Literal;
                return normalizeErrorKey(literal.value);
            }

            return '';
        }

        case 'Literal': {
            const literal = expr as jsep.Literal;
            return normalizeErrorKey(literal.value);
        }

        default:
            throw new Error(`Unknown expression type ${expr.type}`);
    }
}
