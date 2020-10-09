import { requireCurrentInstance } from './helpers';

export function useEmitAsync() {
    const vm = requireCurrentInstance();

    return (event: string, arg?: any) => emitAsync(vm, event, arg);
}

export function emitAsync(vm: Vue, event: string, arg?: any): Promise<void> {
    // hack! we use internal _events prop to handle dynamic events as well
    const listeners = vm.$listeners[event];

    // no listeners available
    if (!listeners) {
        return Promise.resolve();
    }

    if (Array.isArray(listeners)) {
        // there are many listeners for this event
        return Promise.all(listeners.map((s) => s.apply(vm, arg))) as Promise<any>;
    } else {
        const promise = listeners(arg);
        if (promise instanceof Promise) {
            return promise;
        }

        return Promise.resolve();
    }
}
