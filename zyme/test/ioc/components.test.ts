import Vue from 'vue';

import * as zyme from 'zyme';

Vue.use(zyme.IocPlugin);

describe('vue components service injection', () => {
    it('injects services into props', () => {
        @zyme.Injectable()
        class Foo {}

        @zyme.Component()
        class Component extends Vue {
            @zyme.IocInject()
            public foo!: Foo;

            public boo = 'asd';
        }

        let container = new zyme.IocContainer();

        container.bind(Foo).toSelf();

        let cmp = new Component({
            container: container
        });

        expect(cmp.foo).toBeDefined();
        expect(cmp.foo instanceof Foo).toBeTruthy('should be instance of injected class');
    });

    it('register attribute as dependency provider', () => {
        class Foo {}

        @zyme.Component()
        class Component extends Vue {
            @zyme.IocProvide() public foo: Foo = new Foo();
        }

        let container = new zyme.IocContainer();

        let cmp = new Component({
            container: container
        });

        expect(cmp.$container).toBeDefined('should have container');
        expect(cmp.$container).not.toBe(container, 'should have child container');
        expect(cmp.$container.get(Foo)).toBe(cmp.foo, 'should resolve dependency');
        expect(container.isBound(Foo)).toBe(false, 'should not register in parent container');
    });

    it('register property as dependency provider', () => {
        class Foo {}

        @zyme.Component()
        class Component extends Vue {
            private fooz = new Foo();

            @zyme.IocProvide()
            public get foo(): Foo {
                return this.fooz;
            }
        }

        let container = new zyme.IocContainer();

        let cmp = new Component({
            container: container
        });

        expect(cmp.$container).toBeDefined('should have container');
        expect(cmp.$container).not.toBe(container, 'should have child container');
        expect(cmp.$container.get(Foo)).toBe(cmp.foo, 'should resolve dependency');
        expect(container.isBound(Foo)).toBe(false, 'should not register in parent container');
    });

    it('register method as dependency provider', () => {
        class Foo {}

        @zyme.Component()
        class Component extends Vue {
            private fooz = new Foo();

            @zyme.IocProvide()
            public foo(): Foo {
                return this.fooz;
            }
        }

        let container = new zyme.IocContainer();

        let cmp = new Component({
            container: container
        });

        expect(cmp.$container).toBeDefined('should have container');
        expect(cmp.$container).not.toBe(container, 'should have child container');
        expect(cmp.$container.get(Foo)).toBe(cmp.foo(), 'should resolve dependency');
        expect(container.isBound(Foo)).toBe(false, 'should not register in parent container');
    });

    it('dependencies are visible in child components', () => {
        class Foo {}

        @zyme.Injectable()
        class Bar {}

        @zyme.Component()
        class Parent extends Vue {
            @zyme.IocProvide() public foo: Foo = new Foo();
        }

        @zyme.Component()
        class Child extends Vue {
            @zyme.IocInject()
            public foo!: Foo;

            @zyme.IocInject()
            public bar!: Bar;
        }

        let container = new zyme.IocContainer();

        container
            .bind(Bar)
            .toSelf()
            .inSingletonScope();

        let parent = new Parent({
            container: container
        });

        let child = new Child({
            parent: parent
        });

        expect(child.$container).toBeDefined('should have container');
        expect(child.$container).toBe(parent.$container, 'should inherit container');

        expect(child.foo).toBe(parent.foo, 'should inject dependency from parent into child');
        expect(child.bar).toBe(
            container.get(Bar),
            'should inject dependency from main continer into child'
        );
    });

    it('injects dependencies into inherited components', () => {
        @zyme.Injectable()
        class Foo {}

        @zyme.Component()
        class Base extends Vue {
            @zyme.IocInject()
            public foo!: Foo;
        }

        @zyme.Component()
        class Inherited extends Base {
            @zyme.IocInject()
            public fooz!: Foo;
        }

        let container = new zyme.IocContainer();

        container
            .bind(Foo)
            .toSelf()
            .inSingletonScope();

        let cmp = new Inherited({
            container: container
        });

        expect(cmp.foo).toBe(container.get(Foo), 'should inject inherited prop');
        expect(cmp.fooz).toBe(container.get(Foo), 'should inject own prop');
    });

    it('injects optional dependencies into props', () => {
        class Foo {}

        @zyme.Component()
        class Component extends Vue {
            @zyme.IocInject({ optional: true })
            public foo!: Foo;
        }

        let container = new zyme.IocContainer();

        container.bind(Foo).toConstantValue(new Foo());

        let cmp = new Component({
            container: container
        });

        expect(cmp.foo).toBeDefined();
        expect(cmp.foo instanceof Foo).toBe(true);
    });

    it('not injects unavailable optional dependencies into props', () => {
        class Foo {}

        @zyme.Component()
        class Component extends Vue {
            @zyme.IocInject({ optional: true })
            public foo!: Foo;
        }

        let container = new zyme.IocContainer();

        let cmp = new Component({
            container: container
        });

        expect(cmp.foo).toBeNull();
    });

    // powtórzony test
    it('injects optional dependencies into props', () => {
        class Foo {}

        @zyme.Component()
        class Component extends Vue {
            @zyme.IocInject({ optional: true })
            public foo!: Foo;
        }

        let container = new zyme.IocContainer();

        container.bind(Foo).toConstantValue(new Foo());

        let cmp = new Component({
            container: container
        });

        expect(cmp.foo).toBeDefined();
        expect(cmp.foo instanceof Foo).toBe(true);
    });

    it('dependencies can be resolved with container', () => {
        @zyme.Injectable()
        class Foo {}

        @zyme.Injectable()
        class Bar {
            @zyme.IocInject()
            public foo!: Foo;
        }

        @zyme.Component()
        class Parent extends Vue {
            @zyme.IocProvide({ resolve: true })
            public bar!: Bar;
        }

        @zyme.Component()
        class Child extends Vue {
            @zyme.IocInject()
            public foo!: Foo;

            @zyme.IocInject()
            public bar!: Bar;
        }

        let container = new zyme.IocContainer();

        let foo = new Foo();

        container.bind(Foo).toConstantValue(foo);

        let parent = new Parent({
            container: container
        });

        let child = new Child({
            parent: parent
        });

        expect(parent.bar).toBeDefined();
        expect(parent.bar).toBe(parent.$container.get(Bar));
        expect(parent.bar.foo).toBe(foo);
        expect(child.foo).toBe(foo);
        expect(child.bar).toBe(parent.bar);
    });

    it('provided dependencies can depend on each other', () => {
        @zyme.Injectable()
        class Foo {}

        @zyme.Injectable()
        class Bar {
            @zyme.IocInject()
            public foo!: Foo;
        }

        @zyme.Component()
        class Component extends Vue {
            @zyme.IocProvide({ resolve: true })
            public bar!: Bar;

            @zyme.IocProvide({ resolve: true })
            public foo!: Foo;
        }

        let container = new zyme.IocContainer();

        let component = new Component({
            container: container
        });

        expect(component.bar).toBeDefined();
        expect(component.bar).toBe(component.$container.get(Bar));
        expect(component.bar.foo).toBe(component.$container.get(Foo));
        expect(component.foo).toBeDefined();
        expect(component.foo).toBe(component.$container.get(Foo));
    });
});
