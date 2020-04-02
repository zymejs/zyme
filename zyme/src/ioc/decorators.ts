import { interfaces } from 'inversify';
import { inject as inversifyInject, optional as inversifyOptional } from 'inversify';
import { isPlainObject } from 'lodash';
import { isSymbol } from 'lodash';

import 'reflect-metadata';
import Vue, { ComponentOptions } from 'vue';

import * as decorators from '../vuts/decorators';
import * as reflection from '../vuts/reflection';
import { IocContainer } from './container';

export type IocInjectOptions = Defined<ComponentOptions<Vue>['iocInject']>[''];
export type IocRegisterOptions = Defined<ComponentOptions<Vue>['iocRegister']>;
export type IocProvideOptions = Defined<ComponentOptions<Vue>['iocProvide']>[''];

export interface InjectConfig<T> {
    optional?: boolean;
    type?: interfaces.ServiceIdentifier<T>;
}

export interface ProvideConfig<T> {
    resolve?: boolean | Constructor<T>;
    type?: interfaces.ServiceIdentifier<T>;
}

type IocInjectDecorator = PropertyDecorator & ParameterDecorator;

export function IocInject(): IocInjectDecorator;
export function IocInject<T>(config: InjectConfig<T>): IocInjectDecorator;
export function IocInject<T>(type: interfaces.ServiceIdentifier<T>): IocInjectDecorator;
export function IocInject<T>(
    typeOrConfig?: interfaces.ServiceIdentifier<T> | InjectConfig<T>
): IocInjectDecorator {
    let optional = false;
    let identifier: interfaces.ServiceIdentifier<T> | undefined;

    if (isIdentifier(typeOrConfig)) {
        identifier = typeOrConfig;
    } else if (typeOrConfig) {
        optional = !!typeOrConfig.optional;
        identifier = typeOrConfig.type;
    }

    return (target: object, propertyKey: string | symbol, parameterIndex?: number) => {
        identifier = identifier || Reflect.getMetadata('design:type', target, propertyKey);

        if (!identifier && parameterIndex !== undefined) {
            const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
            if (paramTypes) {
                identifier = paramTypes[parameterIndex];
            }
        }

        const id = assertIdentifier(identifier);

        if (target instanceof Vue) {
            // setup ioc configuration for this component
            reflection.addDecorator(target, options => {
                setInjectOptions(options, propertyKey as string, {
                    identifier: id,
                    optional: optional
                });
            });

            // also add this property to be reactive
            decorators.Data()(target, propertyKey);
        } else {
            inversifyInject(id)(target, propertyKey as string, parameterIndex);
            if (optional) {
                inversifyOptional()(target, propertyKey as string);
            }
        }
    };
}

export function IocRegister(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(container: IocContainer) => void>
) {
    reflection.addDecorator(target, o => {
        if (!descriptor.value) {
            return;
        }

        if (!o.iocRegister) {
            o.iocRegister = [];
        }

        o.iocRegister.push(descriptor.value);
    });
}

export function IocProvide<T>(config?: ProvideConfig<T>): PropertyDecorator;
export function IocProvide<T>(type: interfaces.ServiceIdentifier<T>): PropertyDecorator;
export function IocProvide<T>(
    typeOrConfig?: interfaces.ServiceIdentifier<T> | ProvideConfig<T>
): PropertyDecorator {
    let identifier: interfaces.ServiceIdentifier<T> | undefined;
    let resolve: boolean | Constructor<T> | undefined;

    if (isIdentifier(typeOrConfig)) {
        identifier = typeOrConfig;
    } else if (typeOrConfig) {
        identifier = typeOrConfig.type;
        resolve = typeOrConfig.resolve;
    }

    return (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
        identifier =
            identifier ||
            Reflect.getMetadata('design:returntype', target, propertyKey) ||
            Reflect.getMetadata('design:type', target, propertyKey);

        if (resolve === true) {
            resolve = identifier as Constructor;
        } else if (resolve === false) {
            resolve = undefined;
        }

        const id = assertIdentifier(identifier);

        // setup ioc provide configuration for this component
        reflection.addDecorator(target, options => {
            setProvideOptions(options, propertyKey as string, {
                identifier: id,
                resolve: resolve as Constructor<T>
            });

            if (resolve) {
                setInjectOptions(options, propertyKey as string, {
                    identifier: id
                });
            }
        });

        // if it's basic attribute, set this to be reactive
        if (!descriptor) {
            decorators.Data()(target, propertyKey);
        }
    };
}
function isIdentifier<T>(
    obj?: interfaces.ServiceIdentifier<T> | any
): obj is interfaces.ServiceIdentifier<T> {
    return !isPlainObject(obj);
}

function assertIdentifier<T>(
    identifier: interfaces.ServiceIdentifier<T> | undefined
): interfaces.ServiceIdentifier<T> {
    // TODO: add if statement for webpack builds

    // strings and symbols are valid
    if (typeof identifier === 'string' || isSymbol(identifier)) {
        return identifier as interfaces.ServiceIdentifier<T>;
    }

    if (!identifier) {
        throw new Error('Identifier of injected service is not defined');
    }

    const prohibited = [Object, Number, Boolean, String];

    if (prohibited.indexOf(identifier as any) >= 0) {
        throw new Error(`Identifier of injected service '${identifier as any}' is not valid`);
    }

    return identifier;
}

function setInjectOptions(
    componentOptions: ComponentOptions<Vue>,
    property: string,
    options: IocInjectOptions
) {
    const injectOptions = componentOptions.iocInject || (componentOptions.iocInject = {});
    injectOptions[property] = options;
}

function setProvideOptions(
    componentOptions: ComponentOptions<Vue>,
    property: string,
    options: IocProvideOptions
) {
    const provideOptions = componentOptions.iocProvide || (componentOptions.iocProvide = {});
    provideOptions[property] = options;
}
