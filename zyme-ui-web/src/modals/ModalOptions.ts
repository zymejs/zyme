import Vue from 'vue';

import { Modal } from './Modal';

export type ModalData<T extends Modal<any, any>> = T extends Modal<infer TProps, any>
    ? TProps
    : never;

export type ModalResult<T extends Modal<any, any>> = T extends Modal<any, infer TResult>
    ? TResult
    : never;

type ModalDataWrapper<TModal extends Modal<any, any>> = ModalData<TModal> extends void
    ? {}
    : { data: ModalData<TModal> };

type ModalComponent<TModal> = new (...args: any[]) => TModal;

interface ModalOptionsBase<TModal extends Modal<any, any>> {
    component: ModalComponent<TModal> | (() => Promise<ModalComponent<TModal>>);
    parent: Vue;
}

export type ModalOptions<TModal extends Modal<any, any>> = ModalOptionsBase<TModal> &
    ModalDataWrapper<TModal>;
