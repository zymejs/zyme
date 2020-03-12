import { Injectable } from 'zyme';

import { Modal } from './Modal';
import { ModalEntry } from './ModalEntry';
import { ModalOptions, ModalResult } from './ModalOptions';

@Injectable()
export class ModalService {
    private readonly $$stack: Array<ModalEntry<any>> = [];

    public async open<TModal extends Modal<any, any>>(
        options: ModalOptions<TModal>
    ): Promise<ModalResult<TModal>> {
        const entry = new ModalEntry<TModal>(options);

        this.$$stack.push(entry);

        try {
            return await entry.completePromise;
        } finally {
            const index = this.$$stack.indexOf(entry);
            this.$$stack.splice(index, 1);
        }
    }

    public get stack(): Immutable<Array<ModalEntry<any>>> {
        return this.$$stack;
    }
}
