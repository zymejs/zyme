import Vue from 'vue';
import * as zyme from 'zyme';

describe('Component lifecycle hooks decorators', () => {
    it('is run once', () => {
        let runs = 0;

        @zyme.Component()
        class Component extends Vue {
            @zyme.Created
            public foo() {
                runs++;
            }
        }

        let cmp1 = new Component();

        expect(runs).toBe(1);

        let cmp2 = new Component();

        expect(runs).toBe(2);
    });

    it('is run once when inherited', () => {
        let runs = 0;

        @zyme.Component()
        class Base extends Vue {
            @zyme.Created
            public foo() {
                runs++;
            }
        }

        @zyme.Component()
        class Inherited extends Base {}

        let cmp = new Inherited();

        expect(runs).toBe(1);
    });
});
