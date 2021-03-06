/**
 * Marks object as having a type defined.
 */
export interface Typed extends Object {
    readonly $type: string;
}

type TypedProps<T extends Typed> = {
    [P in Exclude<keyof T, '$type'>]: T[P] | Readonly<T[P]> | Immutable<T[P]>
};

export interface PrototypeOptions<T extends Typed> {
    type: string;
    is?(obj: Partial<T>): obj is T;
}

/**
 * Describes a specific type of object
 */
export class Prototype<T extends Typed = Typed> {
    private readonly config: PrototypeOptions<T>;
    public readonly type: string;

    constructor(config: PrototypeOptions<T>) {
        this.config = config;
        this.type = this.config.type;
    }

    public is(obj: object): obj is T {
        if (this.config.is && !this.config.is(obj)) {
            return false;
        }

        return !this.type || (obj as Typed).$type === this.type;
    }

    public create(props: TypedProps<T>): T {
        let obj = {
            $type: this.type
        } as T;

        Object.assign(obj, props);
        return obj;
    }
}
