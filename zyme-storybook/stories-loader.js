const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

module.exports = async function(source) {
    const callback = this.async();
    const dirPath = path.dirname(this.resourcePath);

    try {
        const defs = yaml.safeLoad(source);
        const title = defs.title;

        let result = `
        export default {
            title: '${title}'
        };`;

        const promises = [];

        if (defs.stories) {
            let i = 0;
            for (const storyName of Object.keys(defs.stories)) {
                let storyFiles = defs.stories[storyName];

                if (typeof storyFiles === 'string') {
                    storyFiles = [storyFiles];
                }

                promises.push(loadStory.call(this, i, storyName, storyFiles));
                i++;
            }
        }

        await Promise.all(promises);

        callback(null, result);

        async function loadStory(index, storyName, storyFiles) {
            const sources = [];
            const promises = storyFiles.map(file => loadStoryFile.call(this, file));
            const results = await Promise.all(promises);

            for (const result of results) {
                sources.push(...result);
            }

            result += `\n
        import StoryImport_${index} from '${storyFiles[0]}';
        export const Story_${index} = () => StoryImport_${index};
        Story_${index}.story = {
            name: '${storyName}',
            parameters: {
                sources: ${JSON.stringify(sources)}
            }
        }
        `;
        }

        async function loadStoryFile(storyFile) {
            const storyPath = path.resolve(dirPath, storyFile);
            this.addDependency(storyPath);

            const sources = [];
            const storySource = await fs.promises.readFile(storyPath, 'utf-8');

            sources.push({
                file: storyFile,
                src: storySource
            });

            if (storyFile.endsWith('.vue') == false) {
                // for non-vue files do not process scripts & styles
                return sources;
            }

            const scriptFile = storyFile + '.ts';
            const scriptPath = path.resolve(dirPath, scriptFile);
            const scriptExists = await fileExistsAsync(scriptPath);

            if (scriptExists) {
                sources.push({
                    file: scriptFile,
                    src: await fs.promises.readFile(scriptPath, 'utf-8')
                });
            }

            const styleFile = storyFile + '.scss';
            const stylePath = path.resolve(dirPath, styleFile);
            const styleExists = await fileExistsAsync(stylePath);

            if (styleExists) {
                sources.push({
                    file: styleFile,
                    src: await fs.promises.readFile(stylePath, 'utf-8')
                });
            }

            return sources;
        }

        function fileExistsAsync(path) {
            return new Promise(resolve => {
                fs.access(path, fs.constants.F_OK, err => {
                    resolve(err == null);
                });
            });
        }
    } catch (err) {
        callback(err);
    }
};
