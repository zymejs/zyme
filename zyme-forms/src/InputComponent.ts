import { Component, Prop } from 'zyme';

import { ModelGeneric } from '.';
import { FormElement } from './FormElement';

@Component()
export abstract class InputComponent<TValue = any> extends FormElement {
    @Prop()
    private readonly value?: TValue;

    @Prop({ default: false })
    protected readonly disabled!: boolean;

    @Prop({ type: Object })
    protected readonly model: ModelGeneric | undefined;

    @Prop()
    protected readonly modelKey: string | number | undefined;

    public get inputValue(): TValue | undefined {
        const model = this.formModel;
        const modelKey = this.modelKey;
        if (modelKey && model) {
            return model[modelKey];
        }

        return this.value;
    }

    public input(value: TValue | undefined) {
        if (this.busy || this.disabled) {
            return;
        }

        const model = this.formModel;
        const modelKey = this.modelKey;

        if (model && modelKey) {
            this.$set(model, modelKey, value);
        }

        this.$emit('input', value);
    }
}
