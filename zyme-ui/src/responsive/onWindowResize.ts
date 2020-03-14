import { onUnmounted } from '@vue/composition-api';

export function onWindowResize(callback: () => void) {
    window.addEventListener('resize', callback, { passive: true });

    onUnmounted(() => {
        window.removeEventListener('resize', callback);
    });
}
