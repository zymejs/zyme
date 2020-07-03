import Vue from 'vue';

interface WindowSize {
    width: number;
    height: number;
}

let windowSize: WindowSize;

export function useWindowSize() {
    if (!windowSize) {
        windowSize = Vue.observable({
            width: 0,
            height: 0,
        });

        window.addEventListener('resize', resize, { passive: true });
        resize();
    }

    return windowSize as Readonly<WindowSize>;
}

function resize() {
    windowSize.height = window.innerHeight;
    windowSize.width = window.innerWidth;
}
