import Vue from 'vue';

declare module 'vue/types/vue' {
    interface Vue {
        $scrollTo(element: Element | Vue): void;
    }
}

interface Offset {
    top: number;
    left: number;
}

export function UiWebPlugin(vue: typeof Vue) {
    let scrollToOffset: Offset | undefined;
    let scrollToElement: Element | undefined;
    let scrollTimeout: number | undefined;

    vue.prototype.$scrollTo = function(node: Node | Vue) {
        if (isVue(node)) {
            node = node.$el;
        }

        const element = getElement(node);
        if (!element) {
            return;
        }
        const offset = getOffset(element);

        const shouldScroll =
            // no element to scroll yet
            !scrollToOffset ||
            // the current element is above
            offset.top < scrollToOffset.top ||
            // the current element is more on left, but not below
            (offset.top <= scrollToOffset.top && offset.left < scrollToOffset.left);

        if (shouldScroll) {
            scrollToOffset = offset;
            scrollToElement = element;
        }

        if (scrollTimeout == null) {
            scrollTimeout = window.setTimeout(() => {
                scrollTimeout = undefined;
                if (scrollToElement && scrollToOffset) {
                    try {
                        const boundingRect = scrollToElement.getBoundingClientRect();
                        // we have some basic margin from top and bottom
                        // to preserve better readibility
                        const margin = 20;
                        const isVisible =
                            boundingRect.top > margin &&
                            boundingRect.left > 0 &&
                            boundingRect.bottom < window.innerHeight - margin &&
                            boundingRect.right < window.innerWidth;

                        // it's not needed to scroll to visible element
                        if (isVisible) {
                            return;
                        }

                        const top = offset.top - margin;
                        const middle = offset.top + (boundingRect.height - window.innerHeight) / 2;

                        window.scrollTo(offset.left, Math.min(top, middle));
                    } finally {
                        scrollToElement = undefined;
                        scrollToOffset = undefined;
                    }
                }
            }, 20);
        }
    };
}

function isVue(obj: any): obj is Vue {
    return obj instanceof Vue;
}

function getOffset(el: Element): Offset {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

function getElement(el: Node | null | undefined) {
    while (el) {
        if (el instanceof Element) {
            return el;
        }

        el = el.parentNode;
    }
}
