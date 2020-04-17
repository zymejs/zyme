import { reactive, SetupContext } from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import isFunction from 'lodash/isFunction';

import { PropTypes } from './reexports';

type MixinProps<TProps, TParam> = TProps | ((this: void, param: TParam) => TProps);

export interface MixinOptions<TProps extends {}, TResult extends {}, TParam> {
    props?: MixinProps<TProps, TParam>;
    setup(this: void, props: PropTypes<TProps>, ctx: SetupContext): TResult;
}

export interface Mixin<TProps extends {}, TResult extends {}, TParam> {
    props(param: TParam): TProps;
    setup(this: void, props: PropTypes<TProps>, ctx: SetupContext): UnwrapRef<TResult>;
}

export function mixin<TProps extends {}, TResult extends {}, TParam = void>(
    opts: MixinOptions<TProps, TResult, TParam>
): Mixin<TProps, TResult, TParam> {
    return {
        props: wrapProps(opts.props),
        setup(props, ctx) {
            return reactive(opts.setup(props, ctx));
        },
    };
}

function wrapProps<TProps, TParam>(props: MixinProps<TProps, TParam> | undefined) {
    if (!props) {
        return () => ({} as TProps);
    }

    if (isFunction(props)) {
        return props;
    }

    return () => props;
}
