import { onActivated, onBeforeUnmount, onDeactivated } from '../core';

type EventCallback<T = void> = (arg: T) => void;

const events: { [event: string]: EventCallback<any>[] } = {};

export function useEventBus() {
    return {
        on<T = void>(event: string, fct: EventCallback<T>) {
            on(event, fct);
            onDeactivated(() => off(event, fct));
            onActivated(() => on(event, fct));
            onBeforeUnmount(() => off(event, fct));
        },
        emit,
    };
}

function on<T = void>(event: string, fct: EventCallback<T>) {
    const e = event as string;
    events[e] = events[e] || [];
    events[e].push(fct);

    return () => off(event, fct);
}

function off<T = void>(event: string, fct: EventCallback<T>) {
    const e = event as string;
    const listeners = events[e];
    if (!listeners) {
        return;
    }

    listeners.splice(listeners.indexOf(fct), 1);
}

function emit<T = void>(event: string, arg: T): void {
    const listeners = events[event as string];
    if (!listeners) {
        return;
    }

    for (const cb of listeners) {
        cb(arg);
    }
}
