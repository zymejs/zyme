const obfuscator = require('./css-obfuscator');

module.exports = function ({ prefix, excludeFiles }) {
    return {
        postTransformNode(el, ctx) {
            const filePath = ctx.filename;

            if (excludeFiles && filePath.match(excludeFiles)) {
                return;
            }

            if (el.staticClass) {
                // is serialized to JSON and wrapped with quotes
                const cssClass = JSON.parse(el.staticClass);

                // handle multiple classes
                const classes = cssClass.split(' ');

                const obfuscated = classes
                    .map((c) =>
                        obfuscator.obfuscateClass({
                            file: filePath,
                            cssClass: c,
                            prefix,
                        })
                    )
                    .join(' ');

                el.staticClass = JSON.stringify(obfuscated);
            }
        },
    };
};
