import { DirectiveOptions } from 'vue';

import { breakpoints } from '../responsive';

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
            (typeof window !== 'undefined' && window.innerWidth >= breakpoints.sm)
        ) {
            el.focus();
        }
    },
};
