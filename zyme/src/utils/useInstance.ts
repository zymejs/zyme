import { requireCurrentInstance } from '../core';

export function useInstance() {
    return requireCurrentInstance().proxy;
}
