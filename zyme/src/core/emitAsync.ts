import { requireCurrentInstance } from './helpers';

type EmitAsyncCallback = (event: string, arg?: any) => Promise<void>;

export function useEmitAsync(): EmitAsyncCallback {
    const vm = requireCurrentInstance();

    return (event, arg) => {
        const listeners = vm.$listeners && vm.$listeners[event];

        // no listeners available
        if (!listeners) {
            return Promise.resolve();
        }

        if (Array.isArray(listeners)) {
            // there are many listeners for this event
            return Promise.all(listeners.map(s => s(arg))) as Promise<any>;
        } else {
            return Promise.resolve(listeners(arg)) as Promise<void>;
        }
    };
}
