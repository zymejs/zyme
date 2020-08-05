import { onMounted, onUnmounted } from '@vue/composition-api';

export function useGlobalClass(cssClass: string, ...elements: (Element | undefined | null)[]) {
    onMounted(() => {
        for (const element of elements) {
            element?.classList.add(cssClass);
        }
    });
    onUnmounted(() => {
        for (const element of elements) {
            element?.classList.remove(cssClass);
        }
    });
}
