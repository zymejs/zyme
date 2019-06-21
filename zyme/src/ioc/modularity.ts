import { IocContainer } from './container';

export interface Module {
    register?(container: IocContainer): void;
    run?(container: IocContainer): void;
}

export class Bootstrapper {
    public container: IocContainer;
    private modules: Module[] = [];

    constructor(container?: IocContainer) {
        this.container = container || new IocContainer();
    }

    public addModule(module: Module): Bootstrapper {
        let ctor = Object.getPrototypeOf(module).constructor;
        if (ctor) {
            this.container.bind(ctor).toConstantValue(module);
        }
        this.modules.push(module);
        return this;
    }

    public hasModule(module: Module | Constructor<Module>) {
        return this.modules.some(m => {
            if (module === m) {
                return true;
            }

            let ctor = Object.getPrototypeOf(m).constructor;
            return module === ctor;
        });
    }

    public run() {
        this.modules.forEach(m => m.register && m.register(this.container));
        this.modules.forEach(m => m.run && m.run(this.container));
    }
}
