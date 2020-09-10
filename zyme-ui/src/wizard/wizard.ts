import { getCurrentInstance, Ref, set } from '@vue/composition-api';
import { ComponentOptions } from 'vue';
import {
    assert,
    computed,
    injectService,
    provideService,
    reactive,
    ref,
    unref,
    unwrapComponentDefinition,
    writable,
    ComponentDefinition,
} from 'zyme';
import { Prototype, Typed } from 'zyme-patterns';

import { useVirtualHistory } from '../history';

export interface WizardStep<T = unknown> {
    /** Reactive state of the step */
    readonly state: T;
    next<TNext>(options: WizardStepOptions<TNext>): void;
    replace<TNext>(options: WizardStepOptions<TNext>): void;
    back(): void;
    backToStep(index: number): void;
}

type WizardStepViewOptions<TProps = void> = ComponentOptions<Vue, any, any, any, any, TProps>;

type WizardStepView<T extends WizardStepViewOptions<any>> =
    | T
    | (() => Promise<{ default: T }>)
    | Promise<{ default: T }>;

type WizardStepProps<T> = T extends WizardStepViewOptions<infer TProps> ? TProps : {};
type WizardStepPropsInput<T> = {
    [K in keyof WizardStepProps<T>]: WizardStepProps<T>[K] | Readonly<Ref<WizardStepProps<T>[K]>>;
};

export interface WizardStepAsync<T = unknown> extends WizardStep<T | null> {
    readonly ready: boolean;
    readonly promise: Promise<T>;
}

interface WizardStepOptionsBase<T> {
    view: WizardStepView<T>;
    artifacts?: Typed[];
    canGoBack?: boolean;
}

interface WizardStepOptionsWithProps<T> extends WizardStepOptionsBase<T> {
    props: WizardStepPropsInput<T>;
}

export type WizardStepOptions<T extends WizardStepView<any>> = keyof WizardStepProps<
    T
> extends never
    ? WizardStepOptionsBase<T>
    : WizardStepOptionsWithProps<T>;

export interface WizardStepContext {
    getArtifact<T extends Typed>(type: Prototype<T>): Immutable<T> | null;
    requireArtifact<T extends Typed>(type: Prototype<T>): Immutable<T>;
}

interface WizardStepWrapper<T = unknown> {
    readonly view: ComponentDefinition;
    readonly step: WizardStep<T> | null;
    readonly artifacts: readonly Typed[];
    readonly canGoBack: boolean;
    readonly historyToken: symbol | null;
    readonly scrollY: number;
    readonly scrollX: number;
    readonly props: any;
}

export function useWizard(options?: WizardOptions) {
    return provideService(Wizard, options ?? {});
}

export interface WizardOptions {
    /**
     * Should wizard plug into browser history?
     * True by default.
     */
    useHistory?: boolean;
    /**
     * Should wizard auto scroll to previous position on going back?
     */
    useScroll?: boolean;

    /**
     * Default behavior for every step to determine, if you can go back.
     */
    canGoBack?: () => boolean;
}

export class Wizard {
    public readonly history: Readonly<WizardStepWrapper[]> = [];

    private readonly virtualHistory: FunctionResult<typeof useVirtualHistory> | null;

    constructor(private readonly options: WizardOptions) {
        if (options.useHistory !== false) {
            this.virtualHistory = useVirtualHistory();
        } else {
            this.virtualHistory = null;
        }
    }

    public get currentStep(): WizardStepWrapper | null {
        return this.history[this.history.length - 1] ?? null;
    }

    public get currentView() {
        return this.currentStep?.view;
    }

    public next<T>(options: WizardStepOptions<T>): void {
        this.setStep(this.history.length, options);
    }

    public replace<T>(options: WizardStepOptions<T>): void {
        this.setStep(this.history.length - 1, options);
    }

    private setStep<T>(index: number, options: WizardStepOptions<T>) {
        index = Math.max(index, 0);

        let historyToken: symbol | undefined;

        // There's no need to initiate virtual history on first state.
        if (index > 0) {
            historyToken = this.virtualHistory?.pushState(() => {
                this.backCore(false);
            });
        }

        const doc = document.documentElement;
        const left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        const props = (options as WizardStepOptionsWithProps<T>).props;

        const canGoBackInit = index > 0 && options.canGoBack !== false;
        const canGoBack = computed(() => {
            if (!canGoBackInit) {
                return false;
            }

            if (this.options.canGoBack && !this.options.canGoBack()) {
                return false;
            }

            return true;
        });

        const step = reactive({
            view: unwrapComponentDefinition(options.view),
            canGoBack: unref(canGoBack),
            step: null,
            artifacts: options.artifacts ?? [],
            historyToken: historyToken ?? null,
            scrollX: left,
            scrollY: top,
            props: props ?? null,
        }) as WizardStepWrapper<T>;

        set(this.history, index, step);
    }

    public back(): boolean {
        return this.backCore(true);
    }

    public backToStep(index: number): boolean {
        return this.backCore(true, index);
    }

    private backCore(popHistory: boolean, index?: number) {
        const history = writable(this.history);
        const canGoBack = this.currentStep?.canGoBack;

        if (!canGoBack) {
            if (popHistory) {
                throw new Error("Can't go back from current step");
            } else {
                this.preventGoBackCallback();
                return false;
            }
        }

        if (index && (index >= history.length - 1 || index < 0)) {
            throw new Error("Can't go back to step " + index);
        }

        while (true) {
            const popped = history.pop();
            if (!popped) {
                return false;
            }

            if (!index || index + 1 == history.length) {
                if (popHistory && popped.historyToken) {
                    this.virtualHistory?.popState(popped.historyToken);
                }

                if (this.options.useScroll !== false) {
                    setTimeout(() => {
                        window.scrollTo(popped.scrollX, popped.scrollY);
                    });
                }

                return true;
            }
        }
    }

    public getArtifact<T extends Typed>(proto: Prototype<T>) {
        // used to check if we are in setup() function
        const vm = getCurrentInstance();
        return getArtifact(this, proto);
    }

    public requireArtifact<T extends Typed>(proto: Prototype<T>) {
        // used to check if we are in setup() function
        const vm = getCurrentInstance();
        return requireArtifact(this, proto, vm != null);
    }

    private preventGoBackCallback() {
        const current = assert(this.currentStep);

        const newToken = this.virtualHistory?.pushState(() => {
            this.preventGoBackCallback();
        });

        writable(current).historyToken = newToken ?? null;
    }
}

export type WizardStateFactorySync<T> = (ctx: WizardStepContext) => WizardState<T>;
export type WizardStateFactoryAsync<T> = (ctx: WizardStepContext) => Promise<WizardState<T>>;
type WizardStateFactory<T> = WizardStateFactorySync<T> | WizardStateFactoryAsync<T>;

type WizardState<T> = {
    [K in keyof T]-?: T[K] | Ref<T[K]>;
};

export function useWizardStep<T>(factory: WizardStateFactorySync<T>): WizardStep<T> {
    const wizard = injectService(Wizard);
    if (!wizard) {
        throw new Error('No wizard is defined');
    }

    const current = writable(wizard.currentStep);
    if (!current) {
        throw new Error('No current step is defined');
    }

    if (!current.step) {
        current.step = reactive<WizardStep<T>>({
            state: createState(wizard, factory) as T,
            next: wizard.next.bind(wizard),
            replace: wizard.replace.bind(wizard),
            back: wizard.back.bind(wizard),
            backToStep: wizard.backToStep.bind(wizard),
        });
    }

    return current.step as WizardStep<T>;
}

export function useWizardStepAsync<T>(factory: WizardStateFactoryAsync<T>): WizardStepAsync<T> {
    const wizard = injectService(Wizard);

    const current = writable(wizard.currentStep);
    if (!current) {
        throw new Error('No current step is defined');
    }

    if (!current.step) {
        const stateRef: Ref<T | null> = ref(null);
        const statePromise = createState(wizard, factory) as Promise<T>;
        const stateReady = computed(() => stateRef.value != null);

        statePromise.then((s) => (stateRef.value = s));

        current.step = reactive<WizardStepAsync<T>>({
            state: unref(stateRef),
            promise: statePromise,
            ready: unref(stateReady),
            next: wizard.next.bind(wizard),
            replace: wizard.replace.bind(wizard),
            back: wizard.back.bind(wizard),
            backToStep: wizard.backToStep.bind(wizard),
        });
    }

    return current.step as WizardStepAsync<T>;
}

function createState<T>(wizard: Wizard, stateFactory: WizardStateFactory<T>) {
    const duringInit = true;

    const ctx: WizardStepContext = {
        getArtifact: (proto) => getArtifact(wizard, proto),
        requireArtifact: (proto) => requireArtifact(wizard, proto, duringInit),
    };

    return stateFactory(ctx);
}

function requireArtifact<T extends Typed>(wizard: Wizard, proto: Prototype<T>, init: boolean) {
    const artifact = getArtifact(wizard, proto);

    if (!artifact) {
        throw new Error(`Artifact ${proto.type} not found!`);
    }

    return artifact;
}

function getArtifact<T extends Typed>(wizard: Wizard, proto: Prototype<T>) {
    const historyLength = wizard.history.length;

    for (let i = historyLength - 1; i >= 0; i--) {
        const artifacts = wizard.history[i].artifacts;
        for (const artifact of artifacts) {
            if (proto.is(artifact)) {
                return artifact as Immutable<T>;
            }
        }
    }

    return null;
}
