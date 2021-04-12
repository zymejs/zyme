import { useVirtualHistory, VirtualHistoryHandle } from './useVirtualHistory';

export function onHistoryBack(callback: () => void) {
    const virtualHistory = useVirtualHistory();

    let handle: VirtualHistoryHandle | undefined;

    return {
        init() {
            if (!handle) {
                handle = virtualHistory.pushState(callback);
            }
        },
        cancel() {
            if (handle) {
                handle.cancel();
                handle = undefined;
            }
        },
    };
}
