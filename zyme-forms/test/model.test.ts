import * as forms from '../src';

describe('Forms model', () => {
    it('allows setting property validation errors', () => {
        let model = {
            foo: 'bar'
        };

        forms.setErrors(model, [
            {
                key: 'foo',
                message: 'foo message'
            },
            {
                key: 'bar',
                message: 'bar message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, 'foo')).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, 'bar')).toEqual(['bar message']);
    });

    it('model keys are case insensitive', () => {
        let model = {
            foo: 'bar'
        };

        forms.setErrors(model, [
            {
                key: 'Foo',
                message: 'foo message'
            },
            {
                key: 'Bar',
                message: 'bar message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, 'foo')).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, 'bar')).toEqual(['bar message']);
    });

    it('allows setting multiple errors for one property', () => {
        let model = {
            foo: 'bar'
        };

        forms.setErrors(model, [
            {
                key: 'foo',
                message: 'foo message'
            },
            {
                key: 'bar',
                message: 'bar message 1'
            },
            {
                key: 'bar',
                message: 'bar message 2'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, 'foo')).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, 'bar')).toEqual(['bar message 1', 'bar message 2']);
    });

    it('allows setting property errors for nested model', () => {
        let model = {
            foo: {}
        };

        forms.setErrors(model, [
            {
                key: 'foo.bar',
                message: 'foo message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeFalsy();
        expect(forms.hasErrors(model.foo)).toBeTruthy();
        expect(forms.getErrorsForProp(model.foo, 'bar')).toEqual(['foo message']);
    });

    it('allows setting property errors for array item', () => {
        let model = {
            foo: [{
                bar: ''
            }]
        };

        forms.setErrors(model, [
            {
                key: 'foo[0]',
                message: 'foo message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeFalsy();
        expect(forms.hasErrors(model.foo)).toBeFalsy();
        expect(forms.hasErrors(model.foo[0])).toBeTruthy();
        expect(forms.getErrorsForProp(model.foo[0], '')).toEqual(['foo message']);
    });

    it('allows setting property errors for array item prop', () => {
        let model = {
            foo: [{
                bar: ''
            }]
        };

        forms.setErrors(model, [
            {
                key: 'foo[0].bar',
                message: 'foo message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeFalsy();
        expect(forms.hasErrors(model.foo)).toBeFalsy();
        expect(forms.hasErrors(model.foo[0])).toBeTruthy();
        expect(forms.getErrorsForProp(model.foo[0], 'bar')).toEqual(['foo message']);
    });

    it('allows setting empty key validation errors for top model', () => {
        let model = {
            foo: 'bar'
        };

        forms.setErrors(model, [
            {
                key: '',
                message: 'foo message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, '')).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, null)).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, undefined)).toEqual(['foo message']);
    });

    it('allows setting null key validation errors for top model', () => {
        let model = {
            foo: 'bar'
        };

        forms.setErrors(model, [
            {
                key: null,
                message: 'foo message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, '')).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, null)).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, undefined)).toEqual(['foo message']);
    });

    it('allows setting undefined key validation errors for top model', () => {
        let model = {
            foo: 'bar'
        };

        forms.setErrors(model, [
            {
                key: undefined,
                message: 'foo message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, '')).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, null)).toEqual(['foo message']);
        expect(forms.getErrorsForProp(model, undefined)).toEqual(['foo message']);
    });

    it('does not propagate errors to properties that dont exist', () => {
        let model = {
            foo: undefined
        };

        forms.setErrors(model, [
            {
                key: 'foo.bar',
                message: 'foo message'
            }
        ]);

        expect(model.foo).toBeUndefined();
        expect(forms.hasErrors(model)).toBeFalsy();
    });

    it('allows setting unnamed errors for nested model', () => {
        let model = {
            foo: {}
        };

        forms.setErrors(model, [
            {
                key: 'foo',
                message: 'foo message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeFalsy();
        expect(forms.hasErrors(model.foo)).toBeTruthy();
        expect(forms.getErrorsForProp(model.foo, '')).toEqual(['foo message']);
    });

    it('allows setting property errors for double nested model', () => {
        let model = {
            foo: {
                bar: {}
            }
        };

        forms.setErrors(model, [
            {
                key: 'foo.kaaz',
                message: 'kaaz message'
            },
            {
                key: 'foo.bar.tzar',
                message: 'tzar message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeFalsy();

        expect(forms.hasErrors(model.foo)).toBeTruthy();
        expect(forms.getErrorsForProp(model.foo, 'kaaz')).toEqual(['kaaz message']);

        expect(forms.hasErrors(model.foo.bar)).toBeTruthy();
        expect(forms.getErrorsForProp(model.foo.bar, 'tzar')).toEqual(['tzar message']);
    });

    it('allows setting dictionary errors for nested model', () => {
        let model = {
            foo: {}
        };

        forms.setErrors(model, [
            {
                key: 'foo["bar"]',
                message: 'bar message'
            },
            {
                key: 'foo["kaz"]',
                message: 'kaz message 1'
            },
            {
                key: 'foo["kaz"]',
                message: 'kaz message 2'
            }
        ]);

        expect(forms.hasErrors(model)).toBeFalsy();
        expect(forms.hasErrors(model.foo)).toBeTruthy();

        expect(forms.getErrorsForProp(model.foo, 'bar')).toEqual(['bar message']);
        expect(forms.getErrorsForProp(model.foo, 'kaz')).toEqual([
            'kaz message 1',
            'kaz message 2'
        ]);
    });

    it('clears errors on setting new ones', () => {
        let model = {};

        forms.setErrors(model, [
            {
                key: 'foo',
                message: 'foo message'
            }
        ]);

        forms.setErrors(model, [
            {
                key: 'baz',
                message: 'baz message'
            },
            {
                key: 'ban',
                message: 'ban message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, 'foo').length).toBe(0);
        expect(forms.getErrorsForProp(model, 'baz')).toEqual(['baz message']);
        expect(forms.getErrorsForProp(model, 'ban')).toEqual(['ban message']);
    });

    it('clears errors on setting new ones when nested', () => {
        let model = {
            foo: {}
        };

        forms.setErrors(model, [
            {
                key: 'foo.bar',
                message: 'bar message'
            },
            {
                key: 'baz',
                message: 'baz message'
            }
        ]);

        forms.setErrors(model, [
            {
                key: 'bak',
                message: 'bak message'
            },
            {
                key: 'ban',
                message: 'ban message'
            }
        ]);

        expect(forms.hasErrors(model)).toBeTruthy();
        expect(forms.getErrorsForProp(model, 'foo')).toEqual([]);
        expect(forms.getErrorsForProp(model, 'baz')).toEqual([]);
        expect(forms.getErrorsForProp(model.foo, 'bar')).toEqual([]);

        expect(forms.getErrorsForProp(model, 'bak')).toEqual(['bak message']);
        expect(forms.getErrorsForProp(model, 'ban')).toEqual(['ban message']);
    });

    it('does not append $errors prop to json', () => {
        let model = {
            foo: 'bar'
        };

        forms.setErrors(model, [
            {
                key: 'foo',
                message: 'foo message'
            },
            {
                key: 'bar',
                message: 'bar message'
            }
        ]);

        let json = JSON.stringify(model);
        let deserialized = JSON.parse(json);

        expect(forms.hasErrors(deserialized)).toBeFalsy();
    });

    it('does not append $errors prop to json for nested model', () => {
        let model = {
            foo: {}
        };

        forms.setErrors(model, [
            {
                key: 'foo',
                message: 'foo message'
            },
            {
                key: 'foo.bar',
                message: 'foo message'
            }
        ]);

        let json = JSON.stringify(model);
        let deserialized = JSON.parse(json);

        expect(forms.hasErrors(deserialized)).toBeFalsy();
        expect(forms.hasErrors(deserialized.foo)).toBeFalsy();
    });
});
