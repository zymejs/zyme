import { requireCurrentInstance } from './helpers';

type EmitAsyncCallback = (event: string, arg?: any) => Promise<void>;

export function useEmitAsync(): EmitAsyncCallback {
    const vm = requireCurrentInstance();

    return async (event, arg) => {
        const listeners = vm.$listeners && vm.$listeners[event];

        // no listeners available
        if (!listeners) {
            return Promise.resolve();
        }

        const promises = Array.isArray(listeners) ? listeners.map(s => s(arg)) : [listeners(arg)];
        await Promise.all(promises.filter(p => p instanceof Promise));
    };
}
