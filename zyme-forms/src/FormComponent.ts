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

    public readonly parentForm?: FormComponent;

    @Created
    protected created() {
        if (this.$parent && this.$parent.$container.isBound(FormComponent)) {
            const parentForm = this.$parent.$container.get(FormComponent);
            (this as Writable<FormComponent>).parentForm = parentForm;
        }
    }

    @IocProvide()
    protected get form(): FormComponent {
        return this;
    }

    @IocProvide()
    protected modelContext: ModelContext<TModel> = new ModelContext(
        () => this.value
    );

    public get busy(): boolean {
        const parent = this.parentForm;
        return this.pendingSubmit != null || (parent != null && parent.busy);
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
