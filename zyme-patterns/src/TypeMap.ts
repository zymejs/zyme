import { Prototype, Typed, TypeKey } from './Prototype';

type TypeMapEntry<T> = [Prototype | string, T];

export class TypeMap<T> {
    private readonly map: Map<TypeKey, T>;

    constructor(entries?: Array<TypeMapEntry<T>>) {
        if (entries) {
            this.map = new Map(entries.map(toMapEntry));
        } else {
            this.map = new Map();
        }
    }

    public get(typeId: TypeKey): T | undefined;
    public get(object: Typed): T | undefined;
    public get(proto: Prototype): T | undefined;
    public get(param: TypeKey | Typed | Prototype): T | undefined {
        if (isTypeId(param)) {
            return this.map.get(param);
        } else if (param instanceof Prototype) {
            return this.map.get(param.type);
        } else {
            return this.map.get(param.$type);
        }
    }

    public set(typeId: TypeKey, value: T): void;
    public set(object: Typed, value: T): void;
    public set(proto: Prototype, value: T): void;
    public set(param: TypeKey | Typed | Prototype, value: T): void {
        if (isTypeId(param)) {
            this.map.set(param, value);
        } else if (param instanceof Prototype) {
            this.map.set(param.type, value);
        } else {
            this.map.set(param.$type, value);
        }
    }

    public setCollection(entries: Array<TypeMapEntry<T>>) {
        for (let entry of entries) {
            this.map.set(...toMapEntry(entry));
        }
    }
}

function toMapEntry<T>(entry: TypeMapEntry<T>): [TypeKey, T] {
    if (isTypeId(entry[0])) {
        return entry as [string, T];
    }

    return [entry[0].type, entry[1]];
}

function isTypeId(param: any): param is TypeKey {
    return typeof param === 'string' || typeof param === 'symbol';
}
