import * as zyme from 'zyme';

describe('IoC populate object', () => {
    it('injects service exported by symbol', () => {
        @zyme.Injectable()
        class Foo {}

        let fooType = Symbol('foo');

        @zyme.Injectable()
        class Bar {
            @zyme.IocInject(fooType) public prop: any;
        }

        let container = new zyme.IocContainer();

        container.bind(fooType).to(Foo);

        let bar = container.resolve(Bar);

        expect(bar).toBeDefined();
        expect(bar instanceof Bar).toBe(true);
        expect(bar.prop).toBeDefined();
        expect(bar.prop instanceof Foo).toBe(true);
    });

    it('injects service exported by class', () => {
        @zyme.Injectable()
        class Foo {}

        @zyme.Injectable()
        class Bar {
            @zyme.IocInject()
            public prop!: Foo;
        }

        let container = new zyme.IocContainer();

        container.bind(Foo).toSelf();

        let bar = container.resolve(Bar);

        expect(bar).toBeDefined();
        expect(bar instanceof Bar).toBe(true);
        expect(bar.prop).toBeDefined();
        expect(bar.prop instanceof Foo).toBe(true);
    });

    it('injects service when inherited', () => {
        @zyme.Injectable()
        class Foo {}

        @zyme.Injectable()
        class Bar {
            @zyme.IocInject()
            public prop!: Foo;
        }

        @zyme.Injectable()
        class Baz extends Bar {
            @zyme.IocInject()
            public foo!: Foo;
        }

        let container = new zyme.IocContainer();

        container.bind(Foo).toSelf();

        let baz = container.resolve(Baz);

        expect(baz instanceof Baz).toBe(true);

        expect(baz.prop).toBeDefined('should be injected into base');
        expect(baz.prop instanceof Foo).toBeTruthy();

        expect(baz.foo).toBeDefined('should be injected into derived type');
        expect(baz.foo instanceof Foo).toBeTruthy();
    });

    it('injects optional dependencies', () => {
        let symbol = Symbol('foo');

        @zyme.Injectable()
        class Bar {
            @zyme.IocInject({ type: symbol, optional: true })
            public foo!: string;
        }

        let container = new zyme.IocContainer();

        container.bind(symbol).toConstantValue('abc');

        let baz = container.resolve(Bar);

        expect(baz.foo).toBe('abc');
    });

    it('not injects unavailable optional dependencies', () => {
        let symbol = Symbol('foo');

        @zyme.Injectable()
        class Bar {
            @zyme.IocInject({ type: symbol, optional: true })
            public foo!: string;
        }

        let container = new zyme.IocContainer();

        let baz = container.resolve(Bar);

        expect(baz.foo).toBeUndefined();
    });
});
