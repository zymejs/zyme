import Vue from 'vue';
import { Component, Data, IocProvide, Mounted, Prop } from 'zyme';

import { Model, ModelGeneric } from './Model';
import { ModelContext } from './ModelContext';

@Component()
export abstract class FormComponent<TModel extends Model = ModelGeneric> extends Vue {
    @Prop({ type: [Object, Array] })
    public readonly value!: TModel;

    @Data()
    private pendingSubmit?: Promise<void>;

    @IocProvide()
    protected get form(): FormComponent {
        return this;
    }

    @IocProvide()
    protected modelContext: ModelContext<TModel> = new ModelContext(() => this.value);

    public get busy() {
        return this.pendingSubmit != null;
    }

    public async submitForm(): Promise<void> {
        const result = this.runSubmit();

        if (result instanceof Promise) {
            this.pendingSubmit = result;

            try {
                await result;
            } finally {
                this.pendingSubmit = undefined;
            }
        }
    }

    private runSubmit(): Promise<any> | undefined {
        if (this.busy) {
            return;
        }

        const submit = this.$listeners && this.$listeners.submit;
        if (submit) {
            if (Array.isArray(submit)) {
                return Promise.all(submit.map(s => s()));
            } else {
                return submit();
            }
        }
    }

    @Mounted
    protected initialize() {
        this.$el.addEventListener('submit', e => {
            e.preventDefault();
            this.submitForm();
            return false;
        });
    }
}
