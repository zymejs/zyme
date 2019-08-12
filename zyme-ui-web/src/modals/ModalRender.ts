import Vue from 'vue';

import { ModalEntry } from './ModalEntry';

export interface ModalStackProps {
    modal: Immutable<ModalEntry<any>>;
}

export const ModalRender = Vue.extend<ModalStackProps>({
    functional: true,
    render(createElement, context) {
        const entry = context.props.modal;
        const options = entry.options;
        const component = options.component;
        return createElement(component as any, {
            props: {
                $$entry: entry
            },
            directives: [
                {
                    name: 'ioc-container',
                    value: options.parent.$container
                }
            ]
        });
    }
});
