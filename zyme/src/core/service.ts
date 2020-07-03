import { inject, provide, reactive } from '@vue/composition-api';

export function injectService<T>(service: Constructor<T>): T;
export function injectService<T>(service: Constructor<T>, opts: { optional: boolean }): T | null;
export function injectService<T>(service: Constructor<T>, opts?: { optional: boolean }): T | null {
    const symbol = getServiceSymbol(service);
    const instance = inject<T | null>(symbol, null);
    if (!instance) {
        if (opts?.optional) {
            return null;
        }

        throw new Error(`Service ${service.name} was not registered`);
    }

    return instance;
}

export function provideService<T extends object>(service: Constructor<T, []>): T;
export function provideService<T extends object>(service: T extends Constructor ? never : T): T;
export function provideService<T extends object, Opts>(
    service: Constructor<T, [Opts]>,
    options: Opts
): T;
export function provideService<T extends object, Opts>(
    service: Constructor<T, [Opts]> | T,
    options?: Opts
): T {
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
