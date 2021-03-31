declare module 'body-scroll-lock' {
    export function disableBodyScroll(el?: Element, options?: BodyScrollOptions): void;
    export function enableBodyScroll(el?: Element): void;
    export function clearAllBodyScrollLocks(): void;

    interface BodyScrollOptions {
        reserveScrollBarGap?: boolean;
        allowTouchMove?: (el: Element) => boolean;
    }
}
