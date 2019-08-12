import Vue from 'vue';

import { Modal } from './Modal';
import { ModalOptions, ModalResult } from './ModalOptions';

export class ModalEntry<TModal extends Modal<any, any>> {
    constructor(public readonly options: Readonly<ModalOptions<TModal>>) {}

    private $$isOpen = false;
    private $$vm?: Vue;

    private $$readyResolve!: () => void;
    private $$readyReject!: () => void;

    private $$completeResolve!: (result: ModalResult<TModal>) => void;
    private $$completeReject!: () => void;

    public get isOpen() {
        return this.$$isOpen;
    }

    public get viewModel(): Vue | undefined {
        return this.$$vm;
    }

    public readonly readyPromise = new Promise<void>((resolve, reject) => {
        this.$$readyResolve = () => {
            this.$$isOpen = true;
            resolve();
        };
        this.$$readyReject = reject;
    });

    public readonly completePromise = new Promise<ModalResult<TModal>>((resolve, reject) => {
        this.$$completeResolve = resolve;
        this.$$completeReject = reject;
    });

    public initialize(vm: Vue, init?: () => Promise<void> | void) {
        this.$$vm = vm;
        if (init) {
            Promise.resolve(init()).then(this.$$readyResolve, this.$$readyReject);
        } else {
            this.$$readyResolve();
        }
    }

    public done(result: ModalResult<TModal>) {
        this.$$completeResolve(result);
        this.$$isOpen = false;
    }

    public cancel() {
        this.$$completeReject();
        this.$$isOpen = false;
    }
}
