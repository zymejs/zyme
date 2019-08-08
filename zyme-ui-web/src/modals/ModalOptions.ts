import Vue from 'vue';

import { Modal } from './Modal';

export type ModalData<TModal extends Modal<any, any>> = TModal extends Modal<infer TProps, any>
    ? TProps
    : never;

export type ModalResult<TModal extends Modal<any, any>> = TModal extends Modal<any, infer TResult>
    ? TResult
    : never;

type ModalDataWrapper<TModal extends Modal<any, any>> = ModalData<TModal> extends void
    ? {}
    : { data: ModalData<TModal> };

interface ModalOptionsBase<TModal extends Modal<any, any>> {
    component: new (...args: any[]) => TModal;
    parent: Vue;
}

export type ModalOptions<TModal extends Modal<any, any>> = ModalOptionsBase<TModal> &
    ModalDataWrapper<TModal>;
