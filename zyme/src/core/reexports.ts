import { defineComponent, ExtractPropTypes } from '@vue/composition-api';
export {
    ref,
    reactive,
    computed,
    set,
    isRef,
    onActivated,
    onBeforeMount,
    onBeforeUpdate,
    onDeactivated,
    onErrorCaptured,
    onUnmounted,
    onUpdated,
    watch,
    provide,
} from '@vue/composition-api';

export const component = defineComponent;

import { ComponentOptions } from 'vue';

export type PropTypes<T> = ExtractPropTypes<T>;

export type ComponentPropOptions<T> = T extends ComponentOptions<Vue, any, any, any, infer P>
    ? P
    : undefined;

export type ComponentProps<T> = ComponentPropOptions<T> extends {}
    ? PropTypes<Defined<ComponentPropOptions<T>>>
    : void;
