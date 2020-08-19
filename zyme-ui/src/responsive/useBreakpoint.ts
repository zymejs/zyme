import { computed } from '@vue/composition-api';

import { breakpoints } from '../breakpoints';
import { useWindowSize } from './useWindowSize';

export function useBreakpoint(breakpoint: string | number) {
    const windowSize = useWindowSize();

    const breakpointSize = typeof breakpoint === 'string' ? breakpoints[breakpoint] : breakpoint;

    return computed(() => windowSize.width >= breakpointSize);
}
