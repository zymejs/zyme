import { inject } from '@vue/composition-api';
import { interfaces } from 'inversify';

import { IocContainer } from '../ioc/container';

export function iocProvide() {
    ///
}

export function iocInject<T>(service: interfaces.ServiceIdentifier<T>) {
    const container = inject<() => IocContainer>(IocContainer.symbol);

    if (!container) {
        throw new Error('No container set');
    }

    return container().get(service);
}
