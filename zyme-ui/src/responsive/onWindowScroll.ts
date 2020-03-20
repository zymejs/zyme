import { onUnmounted } from '@vue/composition-api';

export function onWindowScroll(callback: () => void) {
    window.addEventListener('scroll', callback, { passive: true });

    onUnmounted(() => {
        window.removeEventListener('scroll', callback);
    });
}
