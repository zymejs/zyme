import { requireCurrentInstance } from 'zyme';

export function useScrollToElement() {
    const vm = requireCurrentInstance().proxy;

    return function (opts: ScrollIntoViewOptions) {
        const el = vm.$el;
        if (el) {
            el.scrollIntoView(opts);
        }
    };
}
