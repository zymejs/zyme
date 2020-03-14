import { inject, provide } from '@vue/composition-api';

import { FormModel } from './types';
import { reactive } from '../composition';
import { Form, FormContext } from './form';

const formSymbol = Symbol('form');

export function createForm<T extends {}>(model: FormModel<T>): Form<T>;
export function createForm<T extends {}>(model: null): Form<T | null>;
export function createForm<T extends {} | null>(model: FormModel<T>): Form<T>;
export function createForm<T extends {} | null>(model: FormModel<T>): Form<T> {
    const form = new Form<T>(model);

    return reactive(form) as Form<T>;
}

export function provideFormContext<T>(formContext: FormContext<T>) {
    provide(formSymbol, formContext);
}

export function injectFormContext<T = unknown>() {
    return inject<FormContext<T> | null>(formSymbol, null);
}
