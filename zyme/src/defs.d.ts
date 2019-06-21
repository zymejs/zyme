// import { Container, interfaces } from 'inversify';
// import Vue from 'vue';

// declare module 'vue/types' {
//     // tslint:disable-next-line:no-shadowed-variable
//     interface Vue {
//         readonly $container: Container;
//     }
// }

// export interface IocInjectConfig {
//     identifier: interfaces.ServiceIdentifier<any>;
//     optional?: boolean;
// }

// export interface IocProvideConfig {
//     identifier: interfaces.ServiceIdentifier<any>;
//     resolve?: Constructor;
// }

// declare module 'vue/types/options' {
//     interface ComponentOptions<V extends Vue> {
//         container?: Container;
//         iocProvide?: { [prop: string]: IocProvideConfig };
//         iocInject?: { [prop: string]: IocInjectConfig };
//     }
// }
