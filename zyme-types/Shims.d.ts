declare module '@vue/composition-api/dist/reactivity/ref' {
    const _refBrand: unique symbol;
    // from https://github.com/vuejs/composition-api/pull/199
    interface Ref<T> {
        // readonly [_refBrand]: true;
    }
}

/** Returns obfuscated class name */
declare function $C(cls: string): string;
