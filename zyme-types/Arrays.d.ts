// this is a dummy import just to make it an external module
// it's required to global scope to be working
import Vue from 'vue';

declare global {
    type ArrayItem<T extends ArrayLike<any>> = T[0];
}
