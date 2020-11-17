import { RefParam, toRef } from 'zyme';
import { onMounted, onUnmounted, watch } from '@vue/composition-api';

interface GlobalClassOptions {
    elements: (Element | undefined | null)[];
    condition?: RefParam<boolean>;
}

interface GlobalClassOptionsSingle extends GlobalClassOptions {
    class: string;
}

interface GlobalClassOptionsMulti extends GlobalClassOptions {
    classes: string[];
}

export function useGlobalClass(options: GlobalClassOptionsSingle | GlobalClassOptionsMulti) {
    const classes = (options as GlobalClassOptionsMulti).classes ?? [
        (options as GlobalClassOptionsSingle).class,
    ];
    const elements = options.elements;

    onMounted(() => {
        if (options.condition) {
            watch(
                toRef(options.condition),
                (condition) => (condition ? addClass() : removeClass()),
                { immediate: true }
            );
        } else {
            // no condition - add class immadietely
            addClass();
        }
    });

    onUnmounted(removeClass);

    function addClass() {
        for (const element of elements) {
            element?.classList.add(...classes);
        }
    }

    function removeClass() {
        for (const element of elements) {
            element?.classList.remove(...classes);
        }
    }
}
