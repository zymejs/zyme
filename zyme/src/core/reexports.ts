import { defineComponent } from '@vue/composition-api';
export {
    ref,
    reactive,
    computed,
    set,
    isRef,
    onActivated,
    onBeforeMount,
    onBeforeUnmount,
    onBeforeUpdate,
    onDeactivated,
    onErrorCaptured,
    onMounted,
    onUnmounted,
    onUpdated,
    watch,
    provide
} from '@vue/composition-api';

export const component = defineComponent;

import { ExtractPropTypes } from '@vue/composition-api/dist/component/componentProps';
import { ComponentOptions } from 'vue';

type PropTypesCore<T> = T extends (...args: any[]) => infer R
    ? ExtractPropTypes<R>
    : ExtractPropTypes<T>;

// this fixes some error in vue typings
export type PropTypes<T> = {
    [K in keyof PropTypesCore<T>]: PropTypesCore<T>[K];
};

export type ComponentPropOptions<T> = T extends ComponentOptions<Vue, any, any, any, infer P>
    ? P
    : undefined;

export type ComponentProps<T> = ComponentPropOptions<T> extends {}
    ? PropTypes<Defined<ComponentPropOptions<T>>>
    : void;
