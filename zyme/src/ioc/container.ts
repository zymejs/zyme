import { Container as InversifyContainer } from 'inversify';

export class IocContainer extends InversifyContainer {
    constructor() {
        super();

        this.bind(IocContainer).toDynamicValue(ctx => ctx.container as IocContainer);
    }

    public /* override */ createChild() {
        // we override this method to preserve proper
        // container type across all casesS
        let child = new IocContainer();
        child.parent = this;
        return child;
    }
}
