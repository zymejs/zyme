import { DirectiveOptions } from 'vue';

import { breakpoints } from '../breakpoints';

export const autofocus: DirectiveOptions = {
    inserted(el, binding) {
        const enabled = binding.value === undefined || !!binding.value;
        if (!enabled) {
            return;
        }

        // don't make autofocus on mobile,
        // because it's not convenient to cover half of the screen with keyboard
        if (
            binding.modifiers.mobile ||
            (typeof window !== 'undefined' && window.innerWidth >= (breakpoints.sm ?? 576))
        ) {
            el.focus();
        }
    },
};
