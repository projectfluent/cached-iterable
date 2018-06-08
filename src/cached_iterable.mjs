/*
 * Base CachedIterable class.
 */
export default class CachedIterable {
    /**
     * Create an `CachedIterable` instance.
     *
     * @param {Iterable} iterable
     * @returns {CachedIterable}
     */
    constructor() {
        this.seen = [];
    }

    /**
     * Create a `CachedIterable` instance from an iterable or, if another
     * instance of `CachedIterable` is passed, return it without any
     * modifications.
     *
     * @param {Iterable} iterable
     * @returns {CachedIterable}
     */
    static from(iterable) {
        if (iterable instanceof this) {
            return iterable;
        }

        return new this(iterable);
    }
}
