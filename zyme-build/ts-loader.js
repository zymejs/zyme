const { getOptions } = require('loader-utils');

const { obfuscateSource } = require('./css-obfuscator');

module.exports = function (source) {
    this.cacheable && this.cacheable();
    const options = getOptions(this) || {};
    const filePath = this.resourcePath;

    if (options.excludeFiles && filePath.match(options.excludeFiles)) {
        return source;
    }

    return obfuscateSource({
        file: filePath,
        source: source,
        prefix: options.prefix,
        minify: options.minify,
    });
};
