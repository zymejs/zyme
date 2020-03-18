import { PropOptions, PropType } from '@vue/composition-api';

type PropOptionsPartial<T> = Omit<PropOptions<T>, 'required' | 'type'>;
type PropOptionsRequired<T> = PropOptions<T, true> & { required: true };
type PropOptionsOptional<T> = PropOptions<T, false> & { required: false };

export function prop<T>(type?: PropType<T>): PropBuilder<T> {
    return {
        optional(opts) {
            return {
                ...opts,
                type: type,
                required: false
            };
        },
        required(opts) {
            return {
                ...opts,
                type: type,
                required: true
            };
        }
    };
}

interface PropBuilder<T> {
    optional(opts?: PropOptionsPartial<T>): PropOptionsOptional<T>;
    required(opts?: PropOptionsPartial<T>): PropOptionsRequired<T>;
}
