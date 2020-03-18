import { CreateElement, FunctionalComponentOptions, RenderContext } from 'vue';

import { breakpoints, Breakpoint } from './breakpoints';
import { useWindowSize } from './useWindowSize';

export const ResponsiveContent: FunctionalComponentOptions<void, void> = {
    functional: true,
    name: 'Responsive',
    render(h: CreateElement, context: RenderContext<any>) {
        const width = useWindowSize().width;

        let currentSlotName: string | undefined;
        let currentSlotBreakpoint = 0;

        const slots = context.slots();

        let defaultBreakpoint = 1;
        if (context.props.breakpoint) {
            const breakpoint = context.props.breakpoint as Breakpoint;
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
    }
};
