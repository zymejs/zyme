import { isRef, ref, watch, Ref } from '@vue/composition-api';
import debounce from 'lodash/debounce';

type Getter<T> = Ref<T> | (() => T);

export interface FuzzySearchOptions<T> {
    items: Getter<readonly T[] | null | undefined>;
    search: Getter<string | null | undefined>;
    keys?: (keyof T)[];
    debounce?: number;
    threshold?: number;
    maxResults?: number;
}

const fuseImport = () => import('fuse.js').then((f) => f.default);
type Fuse = InstanceOf<AsyncFunctionResult<typeof fuseImport>>;

export function useFuzzySearch<T>(options: FuzzySearchOptions<T>) {
    const result = ref<readonly T[]>([]);

    let items = isRef(options.items) ? options.items.value : options.items();
    let search = isRef(options.search) ? options.search.value : options.search();
    let dirty = false;
    let fuse: Fuse;

    const debounceMs = options.debounce ?? 200;

    const runSearch = debounce(runSearchCore, debounceMs, {
        leading: false,
        trailing: true,
    });

    watch(options.items, (i) => {
        items = i;
        dirty = true;
        console.log('items changed', { search, result: result.value });
        runSearch();
    });

    watch(options.search, (s) => {
        search = s;
        console.log('term changed', { search, result: result.value });
        runSearch();
    });

    runSearch();

    async function runSearchCore() {
        if (!items || !items.length || !search || !search.length) {
            setResults(items ?? []);
            return;
        }

        if (!fuse) {
            const fuseClass = await fuseImport();

            fuse = new fuseClass(items ?? [], {
                shouldSort: true,
                minMatchCharLength: 1,
                // take the keys as provided, or search by all keys
                keys: (options.keys ?? []) as string[],
                threshold: options.threshold ?? 0.4,
            });

            dirty = false;
        } else if (dirty) {
            fuse.setCollection(items);
            dirty = false;
        }

        const results = fuse.search(search).map((x) => x.item) as T[];
        setResults(results);
    }

    function setResults(results: readonly T[]) {
        if (options.maxResults) {
            results = results.slice(0, options.maxResults);
        }

        result.value = results;
    }

    return result;
}
