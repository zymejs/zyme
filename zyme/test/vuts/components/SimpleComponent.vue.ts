import Vue from 'vue';
import * as zyme from 'zyme';

@zyme.Component()
export default class SimpleComponent extends Vue {
    @zyme.Prop()
     public foobar!: string;
}
