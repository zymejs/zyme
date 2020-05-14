import { FunctionalComponentOptions } from 'vue';

import { Wizard } from './wizard';

interface WizardComponentProps {
    wizard?: Wizard;
}

export const WizardComponent: FunctionalComponentOptions<WizardComponentProps> = {
    functional: true,
    render(h, ctx) {
        const wizard = ctx.props.wizard;
        const current = wizard?.currentStep;
        if (current) {
            return h(current.view, {
                props: current.props,
                on: ctx.data.on,
                staticClass: ctx.data.staticClass,
                staticStyle: ctx.data.staticStyle,
                class: ctx.data.class,
                style: ctx.data.style
            });
        }

        return [];
    }
};
