import Vue from 'vue';

import { autofocus } from './directives';

export function ZymeUiPlugin(vue: typeof Vue) {
    vue.directive('autofocus', autofocus);
}
