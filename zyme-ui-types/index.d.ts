// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Vue from 'vue';

declare module 'vue/types/vue' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Vue {
        $scrollTo(element: Vue | Element): void;
    }
}
