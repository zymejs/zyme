import Vue from 'vue';

import * as zyme from 'zyme';

Vue.use(zyme.IocPlugin);

describe('IoC inject decorator', () => {
    it('throws when no symbol given', async () => {
        expect(() => {
            class Foo {
                @zyme.IocInject()
                public foo!: any;
            }
        }).toThrowError(/Identifier of injected.*/);
    });

    it('throws when primitive symbol given', async () => {
        expect(() => {
            class Foo {
                @zyme.IocInject()
                public foo!: number;
            }
        }).toThrowError(/Identifier of injected.*/);
    });

    it('throws when interface symbol given', async () => {
        interface Bar {
            asd: number;
        }
        expect(() => {
            class Foo {
                @zyme.IocInject()
                public foo!: Bar;
            }
        }).toThrowError(/Identifier of injected.*/);
    });

    it('throws when plain object symbol given', async () => {
        let fooz = {
            a: 123
        };

        expect(() => {
            class Foo {
                @zyme.IocInject(fooz as any)
                public foo!: any;
            }
        }).toThrowError(/Identifier of injected.*/);
    });
});
