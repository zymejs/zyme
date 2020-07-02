const vueCompilerModule = require('./vue-compiler-module');
const { obfuscateClass } = require('./css-obfuscator');

module.exports = function ({ prefix, excludeFiles }) {
    return {
        vueCompilerModule: vueCompilerModule({
            prefix,
            excludeFiles,
        }),
        vueLoader: {
            loader: require.resolve('./vue-loader'),
            options: {
                prefix,
                excludeFiles,
            },
        },
        cssOptions: {
            esModule: true,
            modules: {
                getLocalIdent: (ctx, localIdentName, localName) => {
                    // We're not obfscating vendor classes
                    if (ctx.resourcePath.indexOf('node_modules') !== -1) {
                        return localName;
                    }

                    if (excludeFiles && ctx.resourcePath.match(excludeFiles)) {
                        return localName;
                    }

                    return obfuscateClass({
                        file: ctx.resourcePath,
                        cssClass: localName,
                        prefix,
                        excludeFiles,
                    });
                },
            },
        },
        tsLoader: {
            loader: require.resolve('./ts-loader'),
            options: {
                prefix,
                excludeFiles,
            },
        },
    };
};
