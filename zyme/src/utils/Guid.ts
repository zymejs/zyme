/**
 * Generates a RFC4122 version 4 compliand GUID
 * Source: https://stackoverflow.com/a/2117523/2202583
 */
export function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        // tslint:disable-next-line: no-bitwise
        let r = (Math.random() * 16) | 0;
        // tslint:disable-next-line: no-bitwise
        let v = c === 'x' ? r : (r & 0x3) | 0x8;

        return v.toString(16);
    });
}
