import Vue from 'vue';
import { getCurrentInstance, reactive } from '@vue/composition-api';
import { interfaces } from 'inversify';

import { getContainer } from './getContainer';

export function useIocInject<T>(service: interfaces.ServiceIdentifier<T>) {
    const vm = getCurrentInstance();
    const container = getContainer(vm as Vue);

    if (!container) {
        throw new Error('No container found');
    }

    return reactive(container.get(service)) as T;
}

export function useIocContainer() {
    const vm = getCurrentInstance();
    const container = getContainer(vm as Vue);
    if (!container) {
        throw new Error('No container found');
    }

    const child = container.createChild();

    (vm as Writable<Vue>).$container = child;

    return child;
}
