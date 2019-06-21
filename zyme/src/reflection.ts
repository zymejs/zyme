
export function getAllMetadata(symbol: any, target: object) {
    let meta = {};
    while (target) {
        Object.assign(meta, Reflect.getOwnMetadata(symbol, target));
        target = Reflect.getPrototypeOf(target);
    }

    return meta;
}