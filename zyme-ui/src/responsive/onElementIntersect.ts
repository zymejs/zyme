import { onMounted, watch, onBeforeUnmount } from '@vue/composition-api';
import { onUnmounted, toRef, RefParam } from 'zyme';

type ElementParam = Element | undefined | null;

export function onElementIntersect(
    element: RefParam<ElementParam>,
    callback: IntersectionObserverCallback,
    options?: () => IntersectionObserverInit
) {
    const elementRef = toRef(element);
    let observer: IntersectionObserver | undefined;

    watch(elementRef, connect);

    onMounted(() => connect(elementRef.value));
    onBeforeUnmount(disconnect);

    function connect(el: ElementParam) {
        disconnect();

        if (!el) {
            return;
        }

        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(callback, options?.());
            observer.observe(el);
        }
    }

    function disconnect() {
        observer?.disconnect();
        observer = undefined;
    }
}
