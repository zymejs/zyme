import { getCurrentInstance, Ref } from '@vue/composition-api';
import Vue, { ComponentOptions } from 'vue';
import {
    assert,
    computed,
    injectService,
    provideService,
    reactive,
    ref,
    unref,
    writable
} from 'zyme';
import { Prototype, Typed } from 'zyme-patterns';

import { useVirtualHistory } from '../history';

// tslint:disable-next-line: no-any
type WizardViewBase = ComponentOptions<Vue, any, any, any, any, any>;

type WizardStepView = WizardViewBase | (() => Promise<WizardViewBase>);

type WizardStepViewOptions =
    | WizardViewBase
    | (() => Promise<{ default: WizardViewBase }>)
    | Promise<{ default: WizardViewBase }>;

export interface WizardStep<T = unknown> {
    /** Reactive state of the step */
    readonly state: T;
    next(options: WizardNextStepOptions): void;
    back(): void;
}

export interface WizardStepAsync<T = unknown> extends WizardStep<T | null> {
    readonly ready: boolean;
    readonly promise: Promise<T>;
}

export interface WizardStepOptions {
    view: WizardStepViewOptions;
    artifacts?: Typed[];
}

export interface WizardNextStepOptions extends WizardStepOptions {
    canGoBack?: boolean;
}

export interface WizardStepContext {
    getArtifact<T extends Typed>(type: Prototype<T>): Immutable<T> | null;
    requireArtifact<T extends Typed>(type: Prototype<T>): Immutable<T>;
}

interface WizardStepWrapper<T = unknown> {
    readonly view: WizardStepView;
    readonly step: WizardStep<T> | null;
    readonly artifacts: readonly Typed[];
    readonly canGoBack: boolean;
    readonly historyToken: symbol | null;
    readonly scrollY: number;
    readonly scrollX: number;
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

    firstStep?: WizardStepOptions;
}

export class Wizard {
    public readonly history: Readonly<WizardStepWrapper[]> = [];

    private readonly virtualHistory: FunctionResult<typeof useVirtualHistory> | null;

    constructor(options: WizardOptions) {
        if (options.useHistory !== false) {
            this.virtualHistory = useVirtualHistory();
        } else {
            this.virtualHistory = null;
        }

        if (options.firstStep) {
            this.next(options.firstStep);
        }
    }

    public get currentStep(): WizardStepWrapper | null {
        return this.history[this.history.length - 1] ?? null;
    }

    public get currentView() {
        return this.currentStep?.view;
    }

    public next(options: WizardNextStepOptions): void {
        const history = writable(this.history);
        const canGoBack = history.length > 0 && options.canGoBack !== false;

        let historyToken: symbol | undefined;

        // There's no need to initiate virtual history on first state.
        if (history.length > 0) {
            historyToken = this.virtualHistory?.pushState(() => {
                if (options.canGoBack === false) {
                    this.preventGoBackCallback();
                } else {
                    this.backCore(false);
                }
            });
        }

        const doc = document.documentElement;
        const left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        history.push({
            view: unwrapWizardView(options.view),
            canGoBack: canGoBack,
            step: null,
            artifacts: options.artifacts ?? [],
            historyToken: historyToken ?? null,
            scrollX: left,
            scrollY: top
        });
    }

    public back(): boolean {
        return this.backCore(true);
    }

    private backCore(popHistory: boolean) {
        const history = writable(this.history);
        const canGoBack = this.currentStep?.canGoBack;

        if (!canGoBack) {
            throw new Error('Cant go back from current step');
        }

        const popped = history.pop();
        if (!popped) {
            return false;
        }

        if (popHistory && popped.historyToken) {
            this.virtualHistory?.popState(popped.historyToken);
        }

        setTimeout(() => {
            window.scrollTo(popped.scrollX, popped.scrollY);
        });

        return true;
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
            back: wizard.back.bind(wizard)
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
        const stateRef = ref<T>(null);
        const statePromise = createState(wizard, factory) as Promise<T>;
        const stateReady = computed(() => stateRef.value != null);

        statePromise.then(s => (stateRef.value = s));

        current.step = reactive<WizardStepAsync<T>>({
            state: unref(stateRef),
            promise: statePromise,
            ready: unref(stateReady),
            next: wizard.next.bind(wizard),
            back: wizard.back.bind(wizard)
        });
    }

    return current.step as WizardStepAsync<T>;
}

function unwrapWizardView(view: WizardStepViewOptions): WizardStepView {
    // unwrap the view promise
    if (view instanceof Promise) {
        return () => view.then(v => v.default);
    }

    if (view instanceof Function) {
        return () => view().then(v => v.default);
    }

    return view;
}

function createState<T>(wizard: Wizard, stateFactory: WizardStateFactory<T>) {
    const duringInit = true;

    const ctx: WizardStepContext = {
        getArtifact: proto => getArtifact(wizard, proto),
        requireArtifact: proto => requireArtifact(wizard, proto, duringInit)
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
