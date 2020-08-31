import { onMounted, onUnmounted } from 'zyme';

export function onKeyUp(callback: (e: KeyboardEvent) => void) {
    onMounted(() => {
        document.addEventListener('keyup', callback);
    });

    onUnmounted(() => {
        document.removeEventListener('keyup', callback);
    });
}
