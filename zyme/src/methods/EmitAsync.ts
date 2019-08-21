import Vue from 'vue';

export function emitAsync(this: Vue, event: string, ...args: any[]): Promise<void> {
    const listeners = this.$listeners && this.$listeners[event];

    // no listeners available
    if (!listeners) {
        return Promise.resolve();
    }

    if (Array.isArray(listeners)) {
        // there are many listeners for this event
        return Promise.all(listeners.map(s => s(...args))) as Promise<any>;
    } else {
        return Promise.resolve(listeners(...args));
    }
}
