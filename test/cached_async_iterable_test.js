import assert from "assert";
import {CachedAsyncIterable} from "../src/index";

/**
 * Return a promise for an array with all the elements of the iterable.
 *
 * It uses for-await to support async iterables which can't be spread with
 * ...iterable. See https://github.com/tc39/proposal-async-iteration/issues/103
 *
 */
async function toArray(iterable) {
    const result = [];
    for await (const elem of iterable) {
        result.push(elem);
    }
    return result;
}

suite("CachedAsyncIterable", function() {
    suite("constructor errors", function(){
        test("no argument", function() {
            function run() {
                new CachedAsyncIterable();
            }

            assert.throws(run, TypeError);
            assert.throws(run, /iteration protocol/);
        });

        test("null argument", function() {
            function run() {
                new CachedAsyncIterable(null);
            }

            assert.throws(run, TypeError);
            assert.throws(run, /iteration protocol/);
        });

        test("bool argument", function() {
            function run() {
                new CachedAsyncIterable(1);
            }

            assert.throws(run, TypeError);
            assert.throws(run, /iteration protocol/);
        });

        test("number argument", function() {
            function run() {
                new CachedAsyncIterable(1);
            }

            assert.throws(run, TypeError);
            assert.throws(run, /iteration protocol/);
        });
    });

    suite("from()", function() {
        test("pass any iterable", async function() {
            const iterable = CachedAsyncIterable.from([1, 2]);
            // No cached elements yet.
            assert.deepEqual([...iterable], []);
            // Deplete the original iterable.
            assert.deepEqual(await toArray(iterable), [1, 2]);
        });

        test("pass another CachedAsyncIterable", function() {
            const iterable1 = new CachedAsyncIterable([1, 2]);
            const iterable2 = CachedAsyncIterable.from(iterable1);
            assert.equal(iterable1, iterable2);
        });
    });

    suite.skip("sync iteration over cached elements", function(){
        let o1, o2;

        suiteSetup(function() {
            o1 = Object();
            o2 = Object();
        });

        test("sync iterable with no cached elements yet", function() {
            function *generate() {
                yield *[o1, o2];
            }

            const iterable = new CachedAsyncIterable(generate());
            assert.deepEqual([...iterable], []);
        });

        test("sync iterable with a few elements cached so far", async function() {
            function *generate() {
                yield *[o1, o2];
            }

            const iterable = new CachedAsyncIterable(generate());
            await iterable.touchNext();
            assert.deepEqual([...iterable], [o1]);
        });

        test("iterable with all cached elements", async function() {
            function *generate() {
                yield *[o1, o2];
            }

            const iterable = new CachedAsyncIterable(generate());
            await iterable.touchNext();
            await iterable.touchNext();
            assert.deepEqual([...iterable], [o1, o2]);
        });

        test("async iterable with no cached elements yet", async function() {
            async function *generate() {
                yield *[o1, o2];
            }

            const iterable = new CachedAsyncIterable(generate());
            assert.deepEqual([...iterable], []);
        });

        test("async iterable with a few elements cached so far", async function() {
            async function *generate() {
                yield *[o1, o2];
            }

            const iterable = new CachedAsyncIterable(generate());
            await iterable.touchNext();
            let x = [...iterable];
            assert.deepEqual([...iterable], [o1])
        });

        test("async iterable with all cached elements", async function() {
            async function *generate() {
                yield *[o1, o2];
            }

            const iterable = new CachedAsyncIterable(generate());
            await iterable.touchNext();
            await iterable.touchNext();
            assert.deepEqual([...iterable], [o1, o2]);
        });
    });

    suite("async iteration", function(){
        let o1, o2;

        suiteSetup(function() {
            o1 = Object();
            o2 = Object();
        });

        test("lazy iterable", async function() {
            async function *generate() {
                yield *[o1, o2];
            }

            const iterable = new CachedAsyncIterable(generate());
            assert.deepEqual(await toArray(iterable), [o1, o2]);
        });

        test("lazy iterable works more than once", async function() {
            async function *generate() {
                let i = 2;

                while (--i) {
                    yield Object();
                }
            }

            const iterable = new CachedAsyncIterable(generate());
            const first = await toArray(iterable);
            assert.deepEqual(await toArray(iterable), first);
        });

        test("lazy iterable can be called multiple times in parallel", async function() {
            let counter = 0;

            async function *generate() {
                while (true) {
                    counter++;
                    yield null;
                }
            }

            // We're testing that if the first call to asyncIterator has been
            // made, but the value of it has not been returned yet,
            // the consecutive call returns the same Promise rather than,
            // attempting to fetch the next item from the iterator.
            const iterable = new CachedAsyncIterable(generate());
            const [val1, val2] = await Promise.all([
                iterable[Symbol.asyncIterator]().next(),
                iterable[Symbol.asyncIterator]().next(),
            ]);
            assert.equal(counter, 1);
            assert.equal(val1, val2);
        });

        test("iterable's next can be called multiple times in parallel", async function() {
            let counter = 0;

            async function *generate() {
                while (true) {
                    counter++;
                    yield null;
                }
            }

            const iterable = new CachedAsyncIterable(generate());
            const iterator = iterable[Symbol.asyncIterator]();
            let val1 = await iterator.next();
            let val2 = await iterator.next();
            assert.equal(counter, 2);
            assert.notEqual(val1, val2);
        });
    });

    suite("async touchNext", function(){
        let o1, o2, generateMessages;

        suiteSetup(function() {
            o1 = Object();
            o2 = Object();

            generateMessages = async function *generateMessages() {
                yield *[o1, o2];
            }
        });

        test("consumes an element into the cache", async function() {
            const iterable = new CachedAsyncIterable(generateMessages());
            assert.equal(iterable.length, 0);
            await iterable.touchNext();
            assert.equal(iterable.length, 1);
        });

        test("allows to consume multiple elements into the cache", async function() {
            const iterable = new CachedAsyncIterable(generateMessages());
            await iterable.touchNext();
            await iterable.touchNext();
            assert.equal(iterable.length, 2);
        });

        test("allows to consume multiple elements at once", async function() {
            const iterable = new CachedAsyncIterable(generateMessages());
            await iterable.touchNext(2);
            assert.equal(iterable.length, 2);
        });

        test("stops at the last element", async function() {
            const iterable = new CachedAsyncIterable(generateMessages());
            await iterable.touchNext();
            await iterable.touchNext();
            await iterable.touchNext();
            assert.equal(iterable.length, 3);

            await iterable.touchNext();
            assert.equal(iterable.length, 3);
        });

        test("works on an empty iterable", async function() {
            async function *generateEmptyMessages() {
                yield *[];
            }
            const iterable = new CachedAsyncIterable(generateEmptyMessages());
            await iterable.touchNext();
            await iterable.touchNext();
            await iterable.touchNext();
            assert.equal(iterable.length, 1);
        });

        test("iteration for such cache works", async function() {
            const iterable = new CachedAsyncIterable(generateMessages());
            await iterable.touchNext();
            await iterable.touchNext();
            await iterable.touchNext();

            // It's a bit quirky compared to the sync counterpart,
            // but there's no good way to fold async iterator into
            // an array.
            let values = [];
            for await (let elem of iterable) {
                values.push(elem);
            }
            assert.deepEqual(values, [o1, o2]);
        });

        test("async version handles sync iterator", async function() {
            const iterable = new CachedAsyncIterable([o1, o2]);
            await iterable.touchNext();
            await iterable.touchNext();
            await iterable.touchNext();

            // It's a bit quirky compared to the sync counterpart,
            // but there's no good way to fold async iterator into
            // an array.
            let values = [];
            for await (let elem of iterable) {
                values.push(elem);
            }
            assert.deepEqual(values, [o1, o2]);
        });

        test("returns the most recent {value, done} object", async function() {
            const iterable = new CachedAsyncIterable([o1, o2]);
            assert.deepEqual(
                await iterable.touchNext(),
                {value: o1, done: false});
            assert.deepEqual(
                await iterable.touchNext(),
                {value: o2, done: false});
            assert.deepEqual(
                await iterable.touchNext(),
                {value: undefined, done: true});
            assert.deepEqual(
                await iterable.touchNext(),
                {value: undefined, done: true});
        });

        test("touchNext can be called multiple times in parallel", async function() {
            let counter = 0;

            async function *generate() {
                let value = 5;
                while (value-- > 0) {
                  counter++;
                  yield await Promise.resolve(value);
                }
            }

            // We're testing that if the first call to asyncIterator has been
            // made, but the value of it has not been returned yet,
            // the consequitive call returns the same Promise rather than,
            // attempting to fetch the next item from the iterator.
            const iterable = new CachedAsyncIterable(generate());
            await Promise.all([
                iterable.touchNext(2),
                iterable[Symbol.asyncIterator]().next(),
                iterable.touchNext(2),
                iterable[Symbol.asyncIterator]().next(),
            ]);
            assert.equal(counter, 4);
        });
    });
});
