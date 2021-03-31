/// <reference path="./bodyScrollLock.d.ts" />

import {
    disableBodyScroll as disableBodyScrollImport,
    enableBodyScroll as enableBodyScrollImport,
} from 'body-scroll-lock';
import { getScrollBarWidth } from 'zyme-ui';

export function disableBodyScroll(target: Element) {
    disableBodyScrollImport(target, {
        // this ensures, that view will not jump when scrollbar disappears or appears
        reserveScrollBarGap: true,
    });

    const scrollbarWidth = `${getScrollBarWidth()}px`;

    // When we disable body scroll padding is added to body
    // to ensure document content will not jump.
    // However, elements that have fixed position, ignores body paddings.
    // So we set a CSS4 variable on the root level, to be used inside styles.
    document.documentElement.style.setProperty('--body-padding-right', scrollbarWidth);
}

export function enableBodyScroll(target: Element) {
    enableBodyScrollImport(target);
    document.documentElement.style.setProperty('--body-padding-right', null);
}

export { clearAllBodyScrollLocks } from 'body-scroll-lock';
