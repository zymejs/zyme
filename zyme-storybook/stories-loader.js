const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

module.exports = function(source) {
    const callback = this.async();
    const dirPath = path.dirname(this.resourcePath);

    const defs = yaml.safeLoad(source);
    const title = defs.title;

    let result = `
        export default {
            title: '${title}'
        };
    `;

    const promises = [];

    if (defs.stories) {
        let i = 0;
        for (const storyName of Object.keys(defs.stories)) {
            const story = defs.stories[storyName];
            const storyIndex = i;
            const storyPath = path.resolve(dirPath, story);

            this.addDependency(storyPath);

            const promise = fs.promises.readFile(storyPath, 'utf-8').then(src => {
                result += `\n
                import StoryImport_${storyIndex} from '${story}';
                export const Story_${storyIndex} = () => StoryImport_${storyIndex};
                Story_${storyIndex}.story = {
                    name: '${storyName}',
                    parameters: {
                        storySource: {
                            source: ${JSON.stringify(src)},
                        }
                    }
                }
            `;
            });

            promises.push(promise);

            i++;
        }
    }

    Promise.all(promises).then(
        () => callback(null, result),
        err => callback(err)
    );
};
