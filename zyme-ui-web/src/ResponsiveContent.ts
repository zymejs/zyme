import Vue, {
    CreateElement,
    FunctionalComponentOptions,
    RenderContext
} from 'vue';

const state = Vue.observable({ width: 0 });
let initialized = false;

export interface ResponsiveContentConfig {
    breakpoints: { [name: string]: number };
}

export function ResponsiveContent(
    config: ResponsiveContentConfig
): FunctionalComponentOptions<void, void> {
    const breakpoints = config.breakpoints;

    return {
        functional: true,
        name: 'Responsive',
        render(h: CreateElement, context: RenderContext<any>) {
            if (!initialized) {
                window.addEventListener('resize', () => {
                    state.width = window.innerWidth;
                });
                state.width = window.innerWidth;
            }

            let width = state.width;

            let currentSlotName: string | undefined;
            let currentSlotBreakpoint = 0;

            const slots = context.slots();

            let defaultBreakpoint = 1;
            if (context.props.breakpoint) {
                defaultBreakpoint = breakpoints[context.props.breakpoint];
            }

            for (let slot of Object.keys(slots)) {
                let breakpoint: number = breakpoints[slot];

                if (slot === 'default') {
                    breakpoint = defaultBreakpoint;
                }

                if (width > breakpoint && breakpoint >= currentSlotBreakpoint) {
                    currentSlotName = slot;
                    currentSlotBreakpoint = breakpoint;
                }
            }

            return currentSlotName && slots[currentSlotName];
        }
    };
}
