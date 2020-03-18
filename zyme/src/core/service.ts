import { inject, provide, reactive } from '@vue/composition-api';

export function injectService<T>(service: Constructor<T>): T {
    const symbol = getServiceSymbol(service);
    const instance = inject<T>(symbol);
    if (!instance) {
        throw new Error(`Service ${service.name} was not registered`);
    }

    return instance;
}

export function provideService<T>(service: Constructor<T, []>): T;
export function provideService<T>(service: T): T;
export function provideService<T, Opts>(service: Constructor<T, [Opts]>, options: Opts): T;
export function provideService<T, Opts>(service: Constructor<T, [Opts]> | T, options?: Opts): T {
    let instance: T;
    let symbol: symbol;

    if (service instanceof Function) {
        instance = new service(options as Opts);
        symbol = getServiceSymbol(service);
    } else {
        const constructor = Object.getPrototypeOf(service).constructor;
        instance = service;
        symbol = getServiceSymbol(constructor);
    }

    instance = reactive(instance) as T;

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
