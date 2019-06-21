import { Prototype, Typed } from './Prototype';

type TypeMapEntry<T> = [Prototype | string, T];

export class TypeMap<T> {
    private readonly map: Map<string, T>;

    constructor(entries?: Array<TypeMapEntry<T>>) {
        if (entries) {
            this.map = new Map<string, T>(entries.map(toMapEntry));
        } else {
            this.map = new Map<string, T>();
        }
    }

    public get(typeId: string): T | undefined;
    public get(object: Typed): T | undefined;
    public get(proto: Prototype): T | undefined;
    public get(param: string | Typed | Prototype): T | undefined {
        if (isTypeId(param)) {
            return this.map.get(param);
        } else if (param instanceof Prototype) {
            return this.map.get(param.type);
        } else {
            return this.map.get(param.$type);
        }
    }

    public set(typeId: string, value: T): void;
    public set(object: Typed, value: T): void;
    public set(proto: Prototype, value: T): void;
    public set(param: string | Typed | Prototype, value: T): void {
        if (isTypeId(param)) {
            this.map.set(param, value);
        } else if (param instanceof Prototype) {
            this.map.set(param.type, value);
        } else {
            this.map.set(param.$type, value);
        }
    }
}

function toMapEntry<T>(entry: TypeMapEntry<T>): [string, T] {
    if (isTypeId(entry[0])) {
        return entry as [string, T];
    }

    return [entry[0].type, entry[1]];
}

function isTypeId(param: any): param is string {
    return typeof param === 'string';
}
