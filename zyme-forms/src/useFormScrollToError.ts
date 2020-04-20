import debounce from 'lodash/debounce';
import { injectService, requireCurrentInstance, watch } from 'zyme';

import { FormContext } from './formContext';
import { FormField } from './formFieldTypes';

let scrollTo: { vm: Vue; top: number } | undefined;

export function useFormScrollToError<T>(field: () => FormField<T>) {
    const formCtx = injectService(FormContext, { optional: true });
    if (!formCtx) {
        return;
    }

    const form = formCtx.form;
    const vm = requireCurrentInstance();

    watch(
        () => form.submitCount,
        () => {
            const fieldErrors = field()?.errors;
            const hasErrors = fieldErrors?.length > 0;

            if (hasErrors) {
                scrollToError(vm);
            }
        }
    );
}

function scrollToError(vm: Vue) {
    const top = (vm.$el as HTMLElement).offsetTop;

    if (scrollTo && scrollTo.top < top) {
        return;
    }

    scrollTo = {
        top,
        vm
    };

    scrollDebounced();
}

const scrollDebounced = debounce(() => {
    scrollTo?.vm.$el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    scrollTo = undefined;
}, 100);
