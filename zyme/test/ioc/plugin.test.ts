import Vue from 'vue';

import * as zyme from 'zyme';

Vue.use(zyme.ZymePlugin);

describe('IoC plugin', () => {
    it('allows setting a container for component', () => {
        let container = new zyme.IocContainer();
        let vm = new Vue({
            container: container
        });

        expect(vm.$container).toBe(container);
    });
});
