declare module 'vue/types/vue' {
    interface Vue {
       readonly $vm: Vue;
    }
}

export * from './plugin';
