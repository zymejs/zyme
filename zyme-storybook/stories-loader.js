const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

module.exports = function(source) {
    this.cacheable && this.cacheable();

    const stories = yaml.safeLoad(source);

    let storyScript = `
const { withStorySource } = require('@storybook/addon-storysource');
import { storiesOf } from '@storybook/vue';
`;

    for (let categoryName of Object.keys(stories)) {
        const category = stories[categoryName];

        for (let storyName of Object.keys(category)) {
            const storyFile = category[storyName];

            storyScript += buildStoryScript({
                categoryName,
                storyName,
                storyFile
            });
        }
    }

    return storyScript;
};

function buildStoryScript({ categoryName, storyName, storyFile }) {
    return `
{
    const src = require('!!raw-loader!${storyFile}').default;
    const story = require('${storyFile}').default;
    
    storiesOf('${categoryName}', module)
        .addDecorator(withStorySource(src))
        .add('${storyName}', () => story);
}`;
}
