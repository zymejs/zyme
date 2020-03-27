import { onUnmounted, watch, Ref } from '@vue/composition-api';
import { ResizeSensor, ResizeSensorCallback } from 'css-element-queries';

export function onElementResize(
    el: Readonly<Ref<Element | Vue | null>>,
    callback: ResizeSensorCallback
) {
    let sensor: ResizeSensor | undefined;

    watch(el, element => {
        detach();

        if (!element) {
            return;
        }

        if (!(element instanceof Element)) {
            element = element.$el;
        }

        sensor = new ResizeSensor(element, callback);
    });

    onUnmounted(detach);

    function detach() {
        sensor?.detach();
        sensor = undefined;
    }
}
