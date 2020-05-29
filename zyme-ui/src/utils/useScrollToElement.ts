import { onMounted, requireCurrentInstance } from 'zyme';

export function useScrollToElement(opts: ScrollIntoViewOptions) {
    const vm = requireCurrentInstance();

    onMounted(() => {
        const el = vm.$el;
        if (el) {
            el.scrollIntoView(opts);
        }
    });
}
