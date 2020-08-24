import { requireCurrentInstance } from '../core';

export function useNextTick() {
    const vm = requireCurrentInstance();

    return () => vm.$nextTick();
}
