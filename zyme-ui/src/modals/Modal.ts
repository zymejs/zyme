import Vue from 'vue';
import { Component, Created, Prop } from 'zyme';

@Component()
export abstract class Modal<TData = void, TResult = void> extends Vue {
    @Prop()
    private readonly $$entry!: any;

    protected initialize?(): Promise<void> | void;

    protected get data() {
        return (this.$$entry.options as any).data as TData;
    }

    protected get isOpen() {
        return this.$$entry.isOpen;
    }

    @Created
    private $$created() {
        this.$$entry.initialize(this, this.initialize);
    }

    public done(result: TResult) {
        this.$$entry.done(result);
    }

    public cancel() {
        this.$$entry.cancel();
    }
}
