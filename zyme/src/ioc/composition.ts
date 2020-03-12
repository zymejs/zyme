import Vue from 'vue';
import { getCurrentInstance, reactive, provide, inject } from '@vue/composition-api';
import { interfaces } from 'inversify';

import { getContainer } from './getContainer';

export function iocInject<T>(service: interfaces.ServiceIdentifier<T>) {
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

export function injectService<T>(service: Constructor<T>): T {
    const symbol = getServiceSymbol(service);
    const instance = inject<T>(symbol);
    if (!instance) {
        throw new Error(`Service ${service.name} was not registered`);
    }

    return instance;
}

export function provideService<T>(service: Constructor<T, []>): T;
export function provideService<T, Opts>(service: Constructor<T, [Opts]>, options: Opts): T;
export function provideService<T, Opts>(service: Constructor<T, [Opts]>, options?: Opts): T {
    const instance = reactive(new service(options as Opts)) as T;
    const symbol = getServiceSymbol(service);

    provide(symbol, instance);

    return instance;
}

const serviceSymbol = Symbol('service');
function getServiceSymbol(service: any) {
    let symbol = service[serviceSymbol] as symbol;
    if (!symbol) {
        service[serviceSymbol] = symbol = Symbol(service.name);
    }

    return symbol;
}
