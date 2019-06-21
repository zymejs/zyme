import Vue from 'vue';
import * as zyme from 'zyme';

@zyme.Component()
class BaseComponent extends Vue {
    @zyme.Prop()
    public foobar!: string;
}

@zyme.Component()
export default class DerivedComponent extends BaseComponent {
    @zyme.Prop()
    public baz!: string;
}
