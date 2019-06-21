import Vue from 'vue';
import * as zyme from 'zyme';

describe('Component provide/inject decorators', () => {
    it('passes data from parent to child', () => {
        @zyme.Component()
        class Parent extends Vue {
            @zyme.Provide() public foo: string = 'abc';
        }

        @zyme.Component()
        class Child extends Vue {
            @zyme.Inject()
            public foo!: string;
        }

        let parent = new Parent();
        let child = new Child({
            parent: parent
        });

        expect(parent.foo).toBe('abc');
        expect(child.foo).toBe('abc');
    });
});
