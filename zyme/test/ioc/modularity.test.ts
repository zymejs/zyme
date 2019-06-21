import Vue from 'vue';

import * as zyme from 'zyme';

Vue.use(zyme.IocPlugin);

describe('IoC modularity', () => {
    it('bootstapper works with plain object modules', () => {
        let container = new zyme.IocContainer();
        let bootstrapper = new zyme.Bootstrapper(container);

        let module: zyme.Module = {};

        expect(bootstrapper.hasModule(module)).toBe(false);

        bootstrapper.addModule(module);

        expect(bootstrapper.hasModule(module)).toBe(true);
    });

    it('bootstapper registers class modules inside container', () => {
        let container = new zyme.IocContainer();
        let bootstrapper = new zyme.Bootstrapper(container);

        class MyModule implements zyme.Module {}

        let module = new MyModule();

        expect(bootstrapper.hasModule(MyModule)).toBe(false);

        bootstrapper.addModule(module);

        expect(bootstrapper.hasModule(MyModule)).toBe(true);
        expect(container.get(MyModule)).toBe(module);
    });
});
