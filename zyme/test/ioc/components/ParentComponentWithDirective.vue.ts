import Vue from 'vue';
import * as zyme from 'zyme';

import ChildComponent from './ChildComponent.vue';

@zyme.Component({
    components: {
        ChildComponent
    }
})
export default class ParentComponent extends Vue {
    public container = new zyme.IocContainer();
}
