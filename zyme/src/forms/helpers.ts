export function combinePaths(first: string | null, second: string | null) {
    if (!first) {
        return second ?? '';
    }

    if (!second) {
        return first;
    }

    return `${first}.${second}`;
}

export function escapeFieldKey(key: string | null | undefined): string {
    if (key == null) {
        return '';
    }

    return key.replace('\\', '\\\\').replace('.', '\\_');
}
