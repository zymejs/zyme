import { getCurrentInstance } from '@vue/composition-api';
import VueRouter from 'vue-router';

export function useRouter(): VueRouter {
    const instance = getCurrentInstance();
    const router = instance?.proxy?.$router;

    if (!router) {
        throw new Error('No router is configured');
    }

    return router;
}
