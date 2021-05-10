import { onMounted, onBeforeUnmount, watch } from '@vue/composition-api';
import { RefParam } from 'zyme';
import { disableBodyScroll, enableBodyScroll } from './bodyScrollLock';

import { useElement } from './useElement';

interface DisableBodyScrollOptions {
    condition?: RefParam<boolean>;
}

export function useDisableBodyScroll(opts?: DisableBodyScrollOptions) {
    const element = useElement();
    const condition = opts?.condition;

    onMounted(() => {
        if (condition != null) {
            watch(
                condition,
                (x) => {
                    if (x) {
                        disableBodyScroll(element.value!);
                    } else {
                        enableBodyScroll(element.value!);
                    }
                },
                { immediate: true }
            );
        } else {
            disableBodyScroll(element.value!);
        }
    });

    onBeforeUnmount(() => {
        if (element.value) {
            enableBodyScroll(element.value);
        }
    });
}
