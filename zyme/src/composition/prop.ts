import { PropType, PropOptions } from '@vue/composition-api';

type PropOptionsPartial<T> = Omit<PropOptions<T>, 'required' | 'type'>;
type PropOptionsRequired<T> = PropOptions<T, true> & { required: true };
type PropOptionsOptional<T> = PropOptions<T, false> & { required: false };

export function prop<T>(type?: PropType<T>) {
    return {
        optional(opts?: PropOptionsPartial<T>): PropOptionsOptional<T> {
            return {
                ...opts,
                type: type ?? Object,
                required: false
            };
        },
        required(opts?: PropOptionsPartial<T>): PropOptionsRequired<T> {
            return {
                ...opts,
                type: type ?? Object,
                required: true
            };
        }
    };
}
