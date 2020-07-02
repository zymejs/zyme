import Vue, { VNode } from 'vue';

const regex = /\{\s*(\w*)\s*\}/gm;

export const Format = Vue.extend({
    functional: true,
    props: {
        format: {
            type: String,
            required: true,
        },
    },
    render(h, context) {
        const format = context.props.format;
        if (!format) {
            return [];
        }

        const matches = format.matchAll(regex);
        if (!matches) {
            return [textNode(format)];
        }

        const vnodes: VNode[] = [];
        let index = 0;

        for (const match of matches) {
            if (match.index && match.index > index) {
                const text = format.substring(index, match.index);
                vnodes.push(textNode(text));
                index = match.index;
            }

            index += match[0].length;

            const slotName = match[1];
            const slot = context.scopedSlots[slotName];
            if (slot) {
                // there is nothing to pass to scoped slot, so simply pass undefined
                // vue typings require us to pass something
                const slotNodes = slot(undefined);
                if (slotNodes) {
                    for (const slotNode of slotNodes) {
                        vnodes.push(slotNode);
                    }
                }
            }
        }

        if (index < format.length) {
            const text = format.substring(index);
            vnodes.push(textNode(text));
        }

        return vnodes;
    },
});

function textNode(text: string): VNode {
    // You can return string as virtual node if you want to render a text node
    // Check vue docs: https://vuejs.org/v2/guide/render-function.html#createElement-Arguments
    // Vue types does not have support for this, so we need a dirty type casting
    return (text as unknown) as VNode;
}
