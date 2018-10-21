# Changelog

## cached-iterable 0.3.0

  - Ensure that if the CachedAsyncIterable is called multiple times in parallel, it does return the correct value

## cached-iterable 0.2.1

  - Fix `package.json`'s `module` field.

    It now correctly points to `src/index.mjs`.

## cached-iterable 0.2.0

  - Add `CachedSyncIterable` and `CachedAsyncIterable`.

    `CachedIterable` is now an abstarct base class. The sync version now
    lives in the `CachedSyncIterable` sublass, while the async one in
    `CachedAsyncIterable`.

  - Add `CachedAsyncIterable[Symbol.iterator]`. (#1)

    The `[Symbol.iterator]` method returns a synchronous iterator over the
    elements cached by the `CachedAsyncIterable` instance.

  - Add the static `from(iterable)` method. (#3)

    The static method `from()` may be used to create new instances from other
    iterables (which is the same as using the constructor) or to re-use
    existing ones. When an existing instance of a `CachedIterable` subclass
    is passed, `from()` simply returns it, preserving its cached state.

## cached-iterable 0.1.0

This is the first independent release of `cached-iterable`. It corresponds to
`CachedIterable` exported by the `fluent` 0.6.4 package.
