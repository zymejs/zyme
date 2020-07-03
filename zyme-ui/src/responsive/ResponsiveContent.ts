import { FunctionalComponentOptions } from 'vue';

import { breakpoints, Breakpoint } from './breakpoints';
import { useWindowSize } from './useWindowSize';

interface ResponsiveContentProps {
    breakpoint: Breakpoint;
}

export const ResponsiveContent: FunctionalComponentOptions<ResponsiveContentProps> = {
    functional: true,
    name: 'Responsive',
    render(h, context) {
        const width = useWindowSize().width;

        let currentSlotName: string | undefined;
        let currentSlotBreakpoint = 0;

        const slots = context.slots();

        let defaultBreakpoint = 1;
        if (context.props.breakpoint) {
            const breakpoint = context.props.breakpoint;
            defaultBreakpoint = breakpoints[breakpoint];
        }

        for (const slot of Object.keys(slots)) {
            let breakpoint: number = breakpoints[slot as Breakpoint];

            if (slot === 'default') {
                breakpoint = defaultBreakpoint;
            }

            if (width >= breakpoint && breakpoint >= currentSlotBreakpoint) {
                currentSlotName = slot;
                currentSlotBreakpoint = breakpoint;
            }
        }

        return currentSlotName && slots[currentSlotName];
    },
};
