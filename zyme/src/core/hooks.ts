import {
    onMounted as onMountedImport,
    onBeforeUnmount as onBeforeUnmountImport,
} from '@vue/composition-api';

import { requireCurrentInstance } from './helpers';

export function onMounted(callback: (vm: Vue) => void) {
    const vm = requireCurrentInstance();
    onMountedImport(() => callback(vm));
}

export function onBeforeUnmount(callback: (vm: Vue) => void) {
    const vm = requireCurrentInstance();
    onBeforeUnmountImport(() => callback(vm));
}
