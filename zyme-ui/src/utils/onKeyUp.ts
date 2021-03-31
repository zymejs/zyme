import { onMounted, onUnmounted } from 'zyme';

const keys = {
    Escape: {
        code: 27,
        alternative: 'Esc',
    },
    Enter: {
        code: 13,
        alternative: null,
    },
};

type Key = keyof typeof keys;
type KeyCallback = (e: KeyboardEvent) => void;

export function onKeyUp(key: Key, callback: KeyCallback): void;
export function onKeyUp(callback: KeyCallback): void;
export function onKeyUp(keyOrCallback: Key | KeyCallback, callback?: KeyCallback) {
    let cb: KeyCallback;

    if (typeof keyOrCallback === 'string') {
        const key = keys[keyOrCallback];
        cb = (e) => {
            let matching: boolean;

            if ('key' in e) {
                matching =
                    e.key === keyOrCallback ||
                    (key.alternative != null && e.key === key.alternative);
            } else {
                matching = (e as KeyboardEvent).keyCode === 27;
            }

            if (matching) {
                callback!(e);
            }
        };
    } else {
        cb = keyOrCallback;
    }

    onMounted(() => {
        document.addEventListener('keyup', cb);
    });

    onUnmounted(() => {
        document.removeEventListener('keyup', cb);
    });
}
