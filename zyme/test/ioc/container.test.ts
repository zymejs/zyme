import Vue from 'vue';

import * as zyme from 'zyme';

Vue.use(zyme.ZymePlugin);

describe('IoC container', () => {
    it('injecting container gives the same instance', () => {
        let container = new zyme.IocContainer();
        let self = container.get(zyme.IocContainer);

        expect(container).toBe(self);
    });

    it('injecting container from child gives the same instance', () => {
        let container = new zyme.IocContainer();
        let child = container.createChild();
        let self = child.get(zyme.IocContainer);

        expect(container).not.toBe(child);
        expect(child).toBe(self);
    });

    it('injecting container from grandchild gives the same instance', () => {
        let container = new zyme.IocContainer();
        let child = container.createChild();
        let grandchild = child.createChild();
        let self = grandchild.get(zyme.IocContainer);

        expect(container).not.toBe(child);
        expect(container).not.toBe(grandchild);
        expect(grandchild).toBe(self);
    });
});
