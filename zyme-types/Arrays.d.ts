import Vue from 'vue';

declare global {
    type ArrayItem<T extends ArrayLike<any>> = T[0];
}
