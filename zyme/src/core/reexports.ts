import { defineComponent } from '@vue/composition-api';
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

// taken directly from @vue/composition-api, because it does not export these types

declare type Prop<T> = PropOptions<T> | PropType<T>;
declare type DefaultFactory<T> = () => T | null | undefined;
interface PropOptions<T = any> {
    type?: PropType<T> | true | null;
    required?: boolean;
    default?: T | DefaultFactory<T> | null | undefined;
    validator?(value: unknown): boolean;
}
declare type PropType<T> = PropConstructor<T> | PropConstructor<T>[];
declare type PropConstructor<T> =
    | {
          // tslint:disable-next-line: callable-types
          new (...args: any[]): T & object;
      }
    | {
          // tslint:disable-next-line: callable-types
          (): T;
      }
    | {
          // tslint:disable-next-line: callable-types ban-types
          new (...args: string[]): Function;
      };
declare type RequiredKeys<T, MakeDefaultRequired> = {
    [K in keyof T]: T[K] extends
        | {
              required: true;
          }
        | (MakeDefaultRequired extends true
              ? {
                    default: any;
                }
              : never)
        ? K
        : never;
}[keyof T];
declare type OptionalKeys<T, MakeDefaultRequired> = Exclude<
    keyof T,
    RequiredKeys<T, MakeDefaultRequired>
>;
// tslint:disable-next-line: ban-types
declare type ExtractFunctionPropType<
    T extends Function,
    TArgs extends any[] = any[],
    TResult = any
> = T extends (...args: TArgs) => TResult ? T : never;
// tslint:disable-next-line: ban-types
declare type ExtractCorrectPropType<T> = T extends Function
    ? ExtractFunctionPropType<T>
    : Exclude<T, Function>;
declare type InferPropType<T> = T extends null
    ? any
    : T extends {
          type: null | true;
      }
    ? any
    : T extends
          | ObjectConstructor
          | {
                type: ObjectConstructor;
            }
    ? {
          [key: string]: any;
      }
    : T extends
          | BooleanConstructor
          | {
                type: BooleanConstructor;
            }
    ? boolean
    : T extends Prop<infer V>
    ? ExtractCorrectPropType<V>
    : T;
declare type ExtractPropTypes<O, MakeDefaultRequired extends boolean = true> = O extends object
    ? {
          [K in RequiredKeys<O, MakeDefaultRequired>]: InferPropType<O[K]>;
      } &
          {
              [K in OptionalKeys<O, MakeDefaultRequired>]?: InferPropType<O[K]>;
          }
    : {
          [K in string]: any;
      };

import { ComponentOptions } from 'vue';

export type PropTypes<T> = ExtractPropTypes<T>;

export type ComponentPropOptions<T> = T extends ComponentOptions<Vue, any, any, any, infer P>
    ? P
    : undefined;

export type ComponentProps<T> = ComponentPropOptions<T> extends {}
    ? PropTypes<Defined<ComponentPropOptions<T>>>
    : void;
