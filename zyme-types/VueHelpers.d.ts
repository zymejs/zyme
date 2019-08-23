import Vue from 'vue';

declare module 'vue/types/vue' {
    // tslint:disable-next-line:no-shadowed-variable
    interface Vue {
        /**
         * Returns the same exact Vue instance, unproxified.
         * In event handlers all methods are called against Vue instance proxy.
         * Sometimes you need to get to the original one.
         */
        readonly $vm: this;

        /**
         * Emits event and waits for the listeners to perform async operations.
         */
        $emitAsync(event: string, ...args: any[]): Promise<void>;
    }
}
