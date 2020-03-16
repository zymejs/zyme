import Vue from 'vue';
import { Component, IocProvide, Prop } from 'zyme';

import { ModelContext } from './ModelContext';

@Component()
export class FormPartz<TModel> extends Vue {
    @Prop({ type: [Object, Array], required: true })
    protected readonly model!: TModel;

    @IocProvide()
    protected readonly modelContext: ModelContext<TModel> = new ModelContext(() => this.model);
}
