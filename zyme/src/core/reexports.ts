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
    provide,
    Ref
} from '@vue/composition-api';

export const component = defineComponent;

export type Component = FunctionResult<typeof component>;

import { ExtractPropTypes } from '@vue/composition-api/dist/component/componentProps';

export type PropTypes<T> = T extends (...args: any[]) => infer R
    ? ExtractPropTypes<R>
    : ExtractPropTypes<T>;
