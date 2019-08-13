const path = require('path');
const { parseQuery } = require('loader-utils');

const storyRegex = /^(([\w-_]*)\.)?([\w-_]*)\.([\w-_]*)\.story$/;

module.exports = function(source) {
    this.cacheable && this.cacheable();

    if (this.resourceQuery) {
        const query = parseQuery(this.resourceQuery);
        if (query.vue) {
            return source;
        }
    }

    const filePath = this.resourcePath;
    const fileName = path.basename(filePath, '.vue');

    const match = fileName.match(storyRegex);

    const category = match[2];
    const component = getStoryName(match[3]);
    const story = getStoryName(match[4]);

    const name = category ? `${category}|${component}` : component;

    let storyScript = `
const { withStorySource } = require('@storybook/addon-storysource');
import { storiesOf } from '@storybook/vue';

const src = ${JSON.stringify(source)};
const story = require('!!vue-loader!./${fileName}.vue').default;
    
storiesOf('${name}', module)
    .addDecorator(withStorySource(src))
    .add('${story}', () => story);
`;

    return storyScript;
};

function getStoryName(name) {
    // first letter will always be upper case
    let result = name[0].toUpperCase();
    for (let i = 1; i < name.length; i++) {
        let letter = name[i];
        let isUpperCase = letter == letter.toUpperCase();
        if (isUpperCase) {
            result += ' ' + letter.toLowerCase();
        } else {
            result += letter;
        }
    }

    return result;
}
