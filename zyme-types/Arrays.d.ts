// this is a dummy import just to make it an external module
// it's required to global scope to be working
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Vue from 'vue';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ArrayItem<T extends ArrayLike<any>> = T[0];
}
