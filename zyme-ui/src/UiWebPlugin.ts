import Vue, { PluginObject } from 'vue';

import { autofocus } from './directives';
import { breakpoints } from './breakpoints';

interface PluginOptions {
    breakpoints?: { [breakpoint: string]: number };
}

export const ZymeUiPlugin: PluginObject<PluginOptions> = {
    install(vue: typeof Vue, options: PluginOptions | undefined) {
        vue.directive('autofocus', autofocus);

        if (options?.breakpoints) {
            for (const key of Object.keys(breakpoints)) {
                delete breakpoints[key];
            }
            Object.assign(breakpoints, options.breakpoints);
        }
    },
};
