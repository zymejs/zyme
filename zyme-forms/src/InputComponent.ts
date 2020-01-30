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

    public get inputValue(): TValue | null {
        const model = this.formModel;
        const modelKey = this.modelKey;
        if (modelKey && model) {
            return model[modelKey];
        }

        return this.value ?? null;
    }

    public set inputValue(value: TValue | null) {
        this.input(value ?? null);
    }

    public input(value: TValue | null) {
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

    public get /* override */ errors(): string[] {
        if (!this.modelKey) {
            return [];
        }

        return super.errors;
    }
}
