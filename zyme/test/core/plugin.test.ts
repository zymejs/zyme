import Vue from 'vue';
import * as zyme from 'zyme';

Vue.use(zyme.ZymePlugin);

describe('Core plugin', () => {
    it('sets $vm prop on vue components', () => {
        const vm = new Vue();
        expect(vm.$vm).toBe(vm);
    });
});
