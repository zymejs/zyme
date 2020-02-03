import Vue from 'vue';
import { Component, IocInject, Watch } from 'zyme';

import { clearErrorsForProp, getErrorsForProp, ModelGeneric } from './Model';

import { FormComponent } from './FormComponent';
import { ModelContext } from './ModelContext';

@Component()
export abstract class FormElement<TModel extends ModelGeneric = ModelGeneric> extends Vue {
    protected readonly model?: TModel | undefined | null;
    protected readonly modelKey?: string | number | undefined;

    @IocInject({ optional: true })
    protected readonly modelContext?: ModelContext;

    @IocInject({ optional: true })
    protected readonly form?: FormComponent;

    public get formModel(): TModel | undefined {
        const model = this.model;
        if (model === null) {
            return undefined;
        }

        return model || (this.modelContext && (this.modelContext.model as TModel));
    }

    public get errors(): string[] {
        const model = this.formModel;

        if (model) {
            return getErrorsForProp(model, this.modelKey);
        }

        return [];
    }

    public get busy(): boolean {
        return (this.form && this.form.busy) || false;
    }

    public get hasErrors() {
        return this.errors && this.errors.length > 0;
    }

    public clearError() {
        const model = this.formModel;
        const modelKey = this.modelKey;

        if (model && modelKey) {
            clearErrorsForProp(model, modelKey);
        }
    }

    @Watch<FormElement>('errors')
    protected onErrorChanged(errors: string[]) {
        if (errors && errors.length) {
            this.$scrollTo(this);
        }
    }
}
