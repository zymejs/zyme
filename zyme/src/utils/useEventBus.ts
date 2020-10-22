import Vue from 'vue';
import { getCurrentInstance } from '@vue/composition-api';

import { onActivated, onBeforeUnmount, onDeactivated, emitAsync as emitAsyncImport } from '../core';

type EventCallback<T = void> = (arg: T) => void | Promise<void>;

const bus = new Vue();

export function useEventBus() {
    return {
        on<T = void>(event: string, fct: EventCallback<T>) {
            on(event, fct);

            const vm = getCurrentInstance();
            if (vm) {
                onDeactivated(() => off(event, fct));
                onActivated(() => on(event, fct));
                onBeforeUnmount(() => off(event, fct));
            }
        },
        emit,
    };
}

function on<T = void>(event: string, fct: EventCallback<T>) {
    bus.$on(event, fct);

    return () => off(event, fct);
}

function off<T = void>(event: string, fct: EventCallback<T>) {
    bus.$off(event, fct);
}

function emit(event: string): void;
function emit<T>(event: string, arg: T): void;
function emit<T>(event: string, arg?: T): void {
    bus.$emit(event, arg);
}