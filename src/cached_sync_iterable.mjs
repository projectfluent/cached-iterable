import CachedIterable from "./cached_iterable.mjs";

/*
 * CachedSyncIterable caches the elements yielded by an iterable.
 *
 * It can be used to iterate over an iterable many times without depleting the
 * iterable.
 */
export default class CachedSyncIterable extends CachedIterable {
    /**
     * Create an `CachedSyncIterable` instance.
     *
     * @param {Iterable} iterable
     * @returns {CachedSyncIterable}
     */
    constructor(iterable) {
        super();

        if (Symbol.iterator in Object(iterable)) {
            this.iterator = iterable[Symbol.iterator]();
        } else {
            throw new TypeError("Argument must implement the iteration protocol.");
        }
    }

    [Symbol.iterator]() {
        const { seen, iterator } = this;
        let cur = 0;

        return {
            next() {
                if (seen.length <= cur) {
                    seen.push(iterator.next());
                }
                return seen[cur++];
            }
        };
    }

    /**
     * This method allows user to consume the next element from the iterator
     * into the cache.
     *
     * @param {number} count - number of elements to consume
     */
    touchNext(count = 1) {
        const { seen, iterator } = this;
        let idx = 0;
        while (idx++ < count) {
            if (seen.length === 0 || seen[seen.length - 1].done === false) {
                seen.push(iterator.next());
            }
        }
        // Return the last cached {value, done} object to allow the calling
        // code to decide if it needs to call touchNext again.
        return seen[seen.length - 1];
    }
}
