import Vue from 'vue';

import * as zyme from 'zyme';

import Component from './components/ParentComponentWithDirective.vue';

Vue.use(zyme.ZymePlugin);

describe('IoC directives', () => {
    it('using ioc-directive allows to override container', async () => {
        let container = new zyme.IocContainer();
        let component = new Component({
            container: container
        }) as any;

        component.$mount();

        expect(component.$children.length).toBe(3);
        expect(component.$children[0].$container).toBe(component.container);
        expect(component.$children[1].$container).toBe(component.$container);
        expect(component.$children[2].$container).toBe(component.$container);
    });
});
