const path = require('path');

function getBaseName(file) {
    const fileName = path.basename(file);
    return fileName.substring(0, fileName.indexOf('.'));
}

function getBasePath(file) {
    const dir = path.dirname(file);
    const baseName = getBaseName(file);
    return path.join(dir, baseName);
}

function changeExtension(file, ext) {
    var newFile = path.basename(file, path.extname(file)) + ext;
    return path.join(path.dirname(file), newFile);
}

module.exports = {
    getBaseName,
    getBasePath,
    changeExtension,
};
