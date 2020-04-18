import { generateGuid } from 'zyme';

interface VirtualHistoryEntry {
    callback: () => void;
    symbol: symbol;
}

interface VirtualHistoryState {
    marker: 'PG:VirtualHistoryMarker';
    backstackUid: string;
    initial: boolean;
}

const backstack: VirtualHistoryEntry[] = [];
let backstackUid: string | undefined;
let initialized = false;

export function useVirtualHistory() {
    if (!initialized) {
        window.addEventListener('popstate', handlePopState);
        initialized = true;
    }

    return {
        pushState,
        popState
    };
}

function pushState(onBack: () => void): symbol {
    const entry: VirtualHistoryEntry = {
        callback: onBack,
        symbol: Symbol()
    };

    backstack.push(entry);
    setupVirtualState();

    return entry.symbol;
}

function popState(state: symbol) {
    if (isCurrentVirtualState()) {
        let entry = backstack.pop();
        while (entry) {
            if (entry.symbol === state) {
                break;
            }

            entry = backstack.pop();
        }

        if (backstack.length === 0) {
            window.history.back();
        }
    }
}

function handlePopState(event: PopStateEvent) {
    const state = event.state;

    if (!isVirtualState(state)) {
        // this is not a virtual state, let browser handle it
        return;
    }

    if (state.initial && state.backstackUid === backstackUid) {
        // if we went into initial state we run a single callback from the stack
        const entry = backstack.pop();
        if (entry) {
            entry.callback();
        }

        setupVirtualState();
    } else {
        // if we went back or forth into the virtual state
        // it means, that user was into some other browser history state before
        // it would then be handled by the browser (reloading the page)
        // or by the router (reacting to the URL change)
        // so our virtual state will be effect
        backstack.length = 0;
        history.back();
    }
}

function setupVirtualState() {
    if (backstack.length === 0) {
        // there is nothing in the backstack, so we clear out
        backstackUid = undefined;
        return;
    }

    if (!backstackUid) {
        backstackUid = generateGuid();
    }

    if (isCurrentVirtualState()) {
        // if we are already in the virtual state, we don't need to setup it again
        return;
    }

    // Handling history when user clicks on browser back button
    // bases on native HTML5 states

    // We're using only 2 states to handle history:
    // 1. State, entrance on which causes history back
    // 2. Current state

    const initialState: VirtualHistoryState = {
        marker: 'PG:VirtualHistoryMarker',
        backstackUid: backstackUid,
        initial: true
    };

    const virtualState: VirtualHistoryState = {
        marker: 'PG:VirtualHistoryMarker',
        backstackUid: backstackUid,
        initial: false
    };

    // Setting state `1`.
    window.history.replaceState(initialState, document.title, null);

    // State that allows us to handle history back.
    window.history.pushState(virtualState, document.title, null);
}

function isVirtualState(state: typeof history.state): state is VirtualHistoryState {
    const virtualState = state as VirtualHistoryState;

    return virtualState != null && virtualState.marker === 'PG:VirtualHistoryMarker';
}

function isCurrentVirtualState(): boolean {
    const state = history.state;
    return isVirtualState(state) && state.initial === false && state.backstackUid === backstackUid;
}
