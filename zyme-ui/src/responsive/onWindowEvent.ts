import { onMounted, onUnmounted } from '@vue/composition-api';

export function onWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
): void {
    onMounted(() => {
        window.addEventListener(type, listener, options);
    });

    onUnmounted(() => {
        window.removeEventListener(type, listener, options);
    });
}
