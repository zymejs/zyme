import Vue from 'vue';

export function initTest() {
    let errors: Error[];

    beforeEach(() => {
        errors = [];
        Vue.config.errorHandler = e => {
            errors.push(e);
        };
    });

    afterEach(() => {
        for (let error of errors) {
            expect(error).toBeUndefined(error);
        }
        errors = [];
    });
}
