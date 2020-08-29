import { onMounted, watch } from '@vue/composition-api';
import { onUnmounted, toRef, RefParam } from 'zyme';

type ElementParam = Element | Window | undefined | null;

export function onElementScroll(element: RefParam<ElementParam>, callback: (event: Event) => void) {
    const elementRef = toRef(element);

    watch(() => elementRef.value, (current, previous) => {
        disconnect(previous);
        connect(current);
    });

    onMounted(() => connect(elementRef.value));
    onUnmounted(() => disconnect(elementRef.value));

    function connect(el: ElementParam) {
        el?.addEventListener('scroll', callback, { passive: true });
    }

    function disconnect(el: ElementParam) {
        el?.removeEventListener('scroll', callback);
    }
}
