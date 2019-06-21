import { ComponentOptions } from 'vue';

import { LifecycleCallback, LifecycleHook } from './defs';

const decoratorsSymbol = Symbol('vuts:decorators');

export type DecoratorCallback = (options: ComponentOptions<any>) => void;

export function addDecorator(target: any, callback: DecoratorCallback) {
    let decorators: DecoratorCallback[];

    if (target.hasOwnProperty(decoratorsSymbol)) {
        decorators = target[decoratorsSymbol];
    } else {
        target[decoratorsSymbol] = decorators = [];
    }

    decorators.push(callback);
}

export function getDecorators(target: any): DecoratorCallback[] {
    let proto = target.prototype;
    return proto.hasOwnProperty(decoratorsSymbol) ? proto[decoratorsSymbol] : [];
}

export function addLifecycleHook(target: any, hookName: LifecycleHook, callback?: LifecycleCallback) {
    if (!callback) {
        return;
    }

    addDecorator(target, opts => {
        let hooks = opts[hookName];

        if (isHookArray(hooks)) {
            // there is already a hook array in the options
            // just add another callback
            hooks.push(callback);
        } else if (hooks) {
            // there is a hook in options already, but it's single callback not array
            // convert it to array instead with
            opts[hookName] = [hooks, callback] as any;
        } else {
            // there is no hook yet, add this callback
            opts[hookName] = callback;
        }
    });
}

function isHookArray(hooks: any): hooks is LifecycleCallback[] {
    return Array.isArray(hooks);
}
