# cached-iterable

`cached-iterable` exposes the `CachedItearble` class which implements the
[iterable protocol][].

You can wrap any iterable in these classes to create a new iterable which
caches the yielded elements. This is useful for iterating over an iterable many
times without depleting it.

[iterable protocol]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol

## Installation

`cached-iterable` can be used both on the client-side and the server-side.  You
can install it from the npm registry or use it as a standalone script (as the
`CachedIterable` global).

    npm install cached-iterable

## How to use

```js
import assert from "assert";
import {CachedIterable} from "cached-iterable";

function * countdown(i) {
    while (i--) {
        yield i;
    }
}

let numbers = new CachedIterable(countdown(3));

// `numbers` can be iterated over multiple times.
assert.deepEqual([...numbers], [3, 2, 1, 0]);
assert.deepEqual([...numbers], [3, 2, 1, 0]);
```

## Compatibility

For legacy browsers, the `compat` build has been transpiled using Babel's [env
preset][]. It requires the regenerator runtime provided by [babel-polyfill][].

```javascript
import {CachedIterable} from 'cached-iterable/compat';
```

[env preset]: https://babeljs.io/docs/plugins/preset-env/
[babel-polyfill]: https://babeljs.io/docs/usage/polyfill/
