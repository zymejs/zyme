const { getBasePath } = require('./path-utils');

const prod = process.env.NODE_ENV === 'production';
const classRegex = /\$C\((\'(\^?[\w-_]*)\'|\"(\^?[\w-_]*)\"|(\^?[\w-_]*))\)/g;

if (!process.cssClassIdents) {
    process.cssClassIdents = {};
}
if (!process.cssClassCounter) {
    process.cssClassCounter = 1;
}

function obfuscateClass({ file, cssClass, prefix }) {
    if (prefix == null) {
        prefix = '';
    }

    const basePath = getBasePath(file);

    const isLocal = cssClass.startsWith('_');
    const key = isLocal
        ? `${basePath}#${sanitizeClass(cssClass)}`.toLowerCase()
        : sanitizeClass(cssClass).toLowerCase();
    const ident = getIdent(key);

    const isLibraryClass = cssClass.startsWith('\\^');
    if (isLibraryClass) {
        return cssClass.slice(2);
    }

    if (prod) {
        return `${prefix}${ident}`;
    } else {
        return `${cssClass}__${ident}`;
    }
}

function obfuscateSource({ file, source, prefix }) {
    return source.replace(classRegex, (match, g1, g2, g3, g4) => {
        const className = g2 || g3 || g4;
        if (!className) {
            return g1;
        }

        const obfuscated = obfuscateClass({
            file: file,
            cssClass: className,
            prefix,
        });

        if (g2) {
            // single quoted
            return `'${obfuscated}'`;
        }

        if (g3) {
            // double quoted
            return `"${obfuscated}"`;
        }

        if (g4) {
            // no quoted
            return obfuscated;
        }
    });
}

function sanitizeClass(cssClass) {
    return cssClass.replace('\\', '');
}

function getIdent(key) {
    if (process.cssClassIdents[key]) {
        return process.cssClassIdents[key];
    }

    const nextNumber = process.cssClassCounter++;
    const base36 = nextNumber.toString(36);

    process.cssClassIdents[key] = base36;

    return base36;
}

module.exports = {
    obfuscateClass,
    obfuscateSource,
};
