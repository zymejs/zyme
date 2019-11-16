import Vue from 'vue';
import { Component, Created, Data, IocProvide, Prop } from 'zyme';

import { Model, ModelGeneric } from './Model';
import { ModelContext } from './ModelContext';

@Component()
export abstract class FormComponent<
    TModel extends Model = ModelGeneric
> extends Vue {
    @Prop({ type: [Object, Array] })
    public readonly value!: TModel;

    @Data()
    private pendingSubmit?: Promise<void>;

    @IocProvide()
    protected get form(): FormComponent {
        return this;
    }

    @IocProvide()
    protected modelContext: ModelContext<TModel> = new ModelContext(
        () => this.value
    );

    public get busy(): boolean {
        return this.pendingSubmit != null;
    }

    public async submitForm(): Promise<void> {
        if (this.busy) {
            return;
        }

        this.pendingSubmit = this.$emitAsync('submit');

        try {
            await this.pendingSubmit;
        } finally {
            this.pendingSubmit = undefined;
        }
    }
}
