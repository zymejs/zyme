const { getOptions } = require('loader-utils');
const path = require('path');
const fs = require('fs');

const obfuscator = require('./css-obfuscator');

module.exports = function (source) {
    this.cacheable && this.cacheable();

    const filePath = this.resourcePath;
    const fileName = path.basename(filePath);
    const options = getOptions(this) || {};

    if (options.excludeFiles && filePath.match(options.excludeFiles)) {
        return source;
    }

    this.async();

    const scriptPath = filePath + '.ts';
    const scriptExists = fileExistsAsync(scriptPath);

    const stylePath = filePath + '.scss';
    const styleExists = fileExistsAsync(stylePath);

    source = obfuscator.obfuscateSource({
        file: filePath,
        source: source,
        prefix: options.prefix,
    });

    Promise.all([scriptExists, styleExists])
        .then(([scriptExists, styleExists]) => {
            if (scriptExists) {
                this.addDependency(scriptPath);
                source += `\n<script lang="ts" src="./${fileName}.ts" />`;
            }

            if (styleExists) {
                this.addDependency(stylePath);
                source += `\n<style lang="scss" src="./${fileName}.scss" />`;
            }

            this.callback(null, source);
        })
        .catch((e) => this.callback(e));
};

function fileExistsAsync(path) {
    return new Promise((resolve) => {
        fs.access(path, fs.constants.F_OK, (err) => {
            resolve(err == null);
        });
    });
}
