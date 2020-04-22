import Vue, { ComponentOptions, FunctionalComponentOptions } from 'vue';

type FunctionalBase = FunctionalComponentOptions<any, any>;
type ComponentBase = ComponentOptions<Vue, any, any, any, any, any> | FunctionalBase | typeof Vue;

export type ComponentDefinition =
    | ComponentBase
    | FunctionalBase
    | (() => Promise<ComponentBase>)
    | typeof Vue;

export type ComponentDefinitionInput =
    | ComponentBase
    | FunctionalBase
    | (() => Promise<{ default: ComponentBase }>)
    | Promise<{ default: ComponentBase }>;

export function registerComponent(name: string, component: ComponentDefinitionInput) {
    const unwrapped = unwrapComponentDefinition(component);
    Vue.component(name, unwrapped as any);
}

export function unwrapComponentDefinition(
    component: ComponentDefinitionInput
): ComponentDefinition {
    // unwrap the view promise
    if (component instanceof Promise) {
        return () => component.then(v => v.default);
    }

    if (component instanceof Function) {
        if (isVueSubclass(component)) {
            return component as typeof Vue;
        }

        return () => component().then(v => v.default);
    }

    return component;
}

// tslint:disable-next-line: ban-types
function isVueSubclass(type: Function): type is typeof Vue {
    return type.prototype instanceof Vue;
}
