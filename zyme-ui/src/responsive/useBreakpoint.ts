import { computed } from '@vue/composition-api';

import { breakpoints, Breakpoint } from './breakpoints';
import { useWindowSize } from './useWindowSize';

export function useBreakpoint(breakpoint: Breakpoint) {
    const windowSize = useWindowSize();
    const breakpointSize = breakpoints[breakpoint];

    return computed(() => windowSize.width >= breakpointSize);
}
