import { onMounted, onUnmounted } from '@vue/composition-api';

export function onWindowScroll(callback: () => void) {
    onMounted(() => {
        window.addEventListener('scroll', callback, { passive: true });
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', callback);
    });
}
