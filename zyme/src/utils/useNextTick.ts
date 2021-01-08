import { requireCurrentInstance } from '../core';

export function useNextTick() {
    const vm = requireCurrentInstance().proxy;

    return () => vm.$nextTick();
}
