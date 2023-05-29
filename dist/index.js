import {promises as $53f36$promises, statSync as $53f36$statSync, createReadStream as $53f36$createReadStream} from "node:fs";
import {basename as $53f36$basename} from "node:path";
import {version as $53f36$version} from "process";
import $53f36$nodehttp from "node:http";
import $53f36$nodehttps from "node:https";
import $53f36$nodezlib from "node:zlib";
import $53f36$nodestream, {pipeline as $53f36$pipeline, PassThrough as $53f36$PassThrough} from "node:stream";
import {Buffer as $53f36$Buffer} from "node:buffer";
import {Buffer as $53f36$Buffer1} from "buffer";
import {promisify as $53f36$promisify, types as $53f36$types, deprecate as $53f36$deprecate} from "node:util";
import {format as $53f36$format} from "node:url";
import {isIP as $53f36$isIP} from "node:net";

var $parcel$global =
typeof globalThis !== 'undefined'
  ? globalThis
  : typeof self !== 'undefined'
  ? self
  : typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
  ? global
  : {};
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire2c7c"];
if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire2c7c"] = parcelRequire;
}
parcelRequire.register("47OzZ", function(module, exports) {
/**
 * web-streams-polyfill v3.2.1
 */ (function(global1, factory) {
    factory(module.exports);
})(module.exports, function(exports1) {
    "use strict";
    /// <reference lib="es2015.symbol" />
    const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description)=>`Symbol(${description})`;
    /// <reference lib="dom" />
    function noop() {
        return undefined;
    }
    function getGlobals() {
        if (typeof self !== "undefined") return self;
        else if (typeof window !== "undefined") return window;
        else if (typeof $parcel$global !== "undefined") return $parcel$global;
        return undefined;
    }
    const globals = getGlobals();
    function typeIsObject(x) {
        return typeof x === "object" && x !== null || typeof x === "function";
    }
    const rethrowAssertionErrorRejection = noop;
    const originalPromise = Promise;
    const originalPromiseThen = Promise.prototype.then;
    const originalPromiseResolve = Promise.resolve.bind(originalPromise);
    const originalPromiseReject = Promise.reject.bind(originalPromise);
    function newPromise(executor) {
        return new originalPromise(executor);
    }
    function promiseResolvedWith(value) {
        return originalPromiseResolve(value);
    }
    function promiseRejectedWith(reason) {
        return originalPromiseReject(reason);
    }
    function PerformPromiseThen(promise, onFulfilled, onRejected) {
        // There doesn't appear to be any way to correctly emulate the behaviour from JavaScript, so this is just an
        // approximation.
        return originalPromiseThen.call(promise, onFulfilled, onRejected);
    }
    function uponPromise(promise, onFulfilled, onRejected) {
        PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), undefined, rethrowAssertionErrorRejection);
    }
    function uponFulfillment(promise, onFulfilled) {
        uponPromise(promise, onFulfilled);
    }
    function uponRejection(promise, onRejected) {
        uponPromise(promise, undefined, onRejected);
    }
    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
        return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
    }
    function setPromiseIsHandledToTrue(promise) {
        PerformPromiseThen(promise, undefined, rethrowAssertionErrorRejection);
    }
    const queueMicrotask = (()=>{
        const globalQueueMicrotask = globals && globals.queueMicrotask;
        if (typeof globalQueueMicrotask === "function") return globalQueueMicrotask;
        const resolvedPromise = promiseResolvedWith(undefined);
        return (fn)=>PerformPromiseThen(resolvedPromise, fn);
    })();
    function reflectCall(F, V, args) {
        if (typeof F !== "function") throw new TypeError("Argument is not a function");
        return Function.prototype.apply.call(F, V, args);
    }
    function promiseCall(F, V, args) {
        try {
            return promiseResolvedWith(reflectCall(F, V, args));
        } catch (value) {
            return promiseRejectedWith(value);
        }
    }
    // Original from Chromium
    // https://chromium.googlesource.com/chromium/src/+/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/core/streams/SimpleQueue.js
    const QUEUE_MAX_ARRAY_SIZE = 16384;
    /**
     * Simple queue structure.
     *
     * Avoids scalability issues with using a packed array directly by using
     * multiple arrays in a linked list and keeping the array size bounded.
     */ class SimpleQueue {
        constructor(){
            this._cursor = 0;
            this._size = 0;
            // _front and _back are always defined.
            this._front = {
                _elements: [],
                _next: undefined
            };
            this._back = this._front;
            // The cursor is used to avoid calling Array.shift().
            // It contains the index of the front element of the array inside the
            // front-most node. It is always in the range [0, QUEUE_MAX_ARRAY_SIZE).
            this._cursor = 0;
            // When there is only one node, size === elements.length - cursor.
            this._size = 0;
        }
        get length() {
            return this._size;
        }
        // For exception safety, this method is structured in order:
        // 1. Read state
        // 2. Calculate required state mutations
        // 3. Perform state mutations
        push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) newBack = {
                _elements: [],
                _next: undefined
            };
            // push() is the mutation most likely to throw an exception, so it
            // goes first.
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
                this._back = newBack;
                oldBack._next = newBack;
            }
            ++this._size;
        }
        // Like push(), shift() follows the read -> calculate -> mutate pattern for
        // exception safety.
        shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
                newFront = oldFront._next;
                newCursor = 0;
            }
            // No mutations before this point.
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) this._front = newFront;
            // Permit shifted element to be garbage collected.
            elements[oldCursor] = undefined;
            return element;
        }
        // The tricky thing about forEach() is that it can be called
        // re-entrantly. The queue may be mutated inside the callback. It is easy to
        // see that push() within the callback has no negative effects since the end
        // of the queue is checked for on every iteration. If shift() is called
        // repeatedly within the callback then the next iteration may return an
        // element that has been removed. In this case the callback will be called
        // with undefined values until we either "catch up" with elements that still
        // exist or reach the back of the queue.
        forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while(i !== elements.length || node._next !== undefined){
                if (i === elements.length) {
                    node = node._next;
                    elements = node._elements;
                    i = 0;
                    if (elements.length === 0) break;
                }
                callback(elements[i]);
                ++i;
            }
        }
        // Return the element that would be returned if shift() was called now,
        // without modifying the queue.
        peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
        }
    }
    function ReadableStreamReaderGenericInitialize(reader, stream) {
        reader._ownerReadableStream = stream;
        stream._reader = reader;
        if (stream._state === "readable") defaultReaderClosedPromiseInitialize(reader);
        else if (stream._state === "closed") defaultReaderClosedPromiseInitializeAsResolved(reader);
        else defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
    }
    // A client of ReadableStreamDefaultReader and ReadableStreamBYOBReader may use these functions directly to bypass state
    // check.
    function ReadableStreamReaderGenericCancel(reader, reason) {
        const stream = reader._ownerReadableStream;
        return ReadableStreamCancel(stream, reason);
    }
    function ReadableStreamReaderGenericRelease(reader) {
        if (reader._ownerReadableStream._state === "readable") defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
        else defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
        reader._ownerReadableStream._reader = undefined;
        reader._ownerReadableStream = undefined;
    }
    // Helper functions for the readers.
    function readerLockException(name) {
        return new TypeError("Cannot " + name + " a stream using a released reader");
    }
    // Helper functions for the ReadableStreamDefaultReader.
    function defaultReaderClosedPromiseInitialize(reader) {
        reader._closedPromise = newPromise((resolve, reject)=>{
            reader._closedPromise_resolve = resolve;
            reader._closedPromise_reject = reject;
        });
    }
    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
        defaultReaderClosedPromiseInitialize(reader);
        defaultReaderClosedPromiseReject(reader, reason);
    }
    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
        defaultReaderClosedPromiseInitialize(reader);
        defaultReaderClosedPromiseResolve(reader);
    }
    function defaultReaderClosedPromiseReject(reader, reason) {
        if (reader._closedPromise_reject === undefined) return;
        setPromiseIsHandledToTrue(reader._closedPromise);
        reader._closedPromise_reject(reason);
        reader._closedPromise_resolve = undefined;
        reader._closedPromise_reject = undefined;
    }
    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
        defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
    }
    function defaultReaderClosedPromiseResolve(reader) {
        if (reader._closedPromise_resolve === undefined) return;
        reader._closedPromise_resolve(undefined);
        reader._closedPromise_resolve = undefined;
        reader._closedPromise_reject = undefined;
    }
    const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
    const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
    const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
    const PullSteps = SymbolPolyfill("[[PullSteps]]");
    /// <reference lib="es2015.core" />
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite#Polyfill
    const NumberIsFinite = Number.isFinite || function(x) {
        return typeof x === "number" && isFinite(x);
    };
    /// <reference lib="es2015.core" />
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc#Polyfill
    const MathTrunc = Math.trunc || function(v) {
        return v < 0 ? Math.ceil(v) : Math.floor(v);
    };
    // https://heycam.github.io/webidl/#idl-dictionaries
    function isDictionary(x) {
        return typeof x === "object" || typeof x === "function";
    }
    function assertDictionary(obj, context) {
        if (obj !== undefined && !isDictionary(obj)) throw new TypeError(`${context} is not an object.`);
    }
    // https://heycam.github.io/webidl/#idl-callback-functions
    function assertFunction(x, context) {
        if (typeof x !== "function") throw new TypeError(`${context} is not a function.`);
    }
    // https://heycam.github.io/webidl/#idl-object
    function isObject(x) {
        return typeof x === "object" && x !== null || typeof x === "function";
    }
    function assertObject(x, context) {
        if (!isObject(x)) throw new TypeError(`${context} is not an object.`);
    }
    function assertRequiredArgument(x, position, context) {
        if (x === undefined) throw new TypeError(`Parameter ${position} is required in '${context}'.`);
    }
    function assertRequiredField(x, field, context) {
        if (x === undefined) throw new TypeError(`${field} is required in '${context}'.`);
    }
    // https://heycam.github.io/webidl/#idl-unrestricted-double
    function convertUnrestrictedDouble(value) {
        return Number(value);
    }
    function censorNegativeZero(x) {
        return x === 0 ? 0 : x;
    }
    function integerPart(x) {
        return censorNegativeZero(MathTrunc(x));
    }
    // https://heycam.github.io/webidl/#idl-unsigned-long-long
    function convertUnsignedLongLongWithEnforceRange(value, context) {
        const lowerBound = 0;
        const upperBound = Number.MAX_SAFE_INTEGER;
        let x = Number(value);
        x = censorNegativeZero(x);
        if (!NumberIsFinite(x)) throw new TypeError(`${context} is not a finite number`);
        x = integerPart(x);
        if (x < lowerBound || x > upperBound) throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
        if (!NumberIsFinite(x) || x === 0) return 0;
        // TODO Use BigInt if supported?
        // let xBigInt = BigInt(integerPart(x));
        // xBigInt = BigInt.asUintN(64, xBigInt);
        // return Number(xBigInt);
        return x;
    }
    function assertReadableStream(x, context) {
        if (!IsReadableStream(x)) throw new TypeError(`${context} is not a ReadableStream.`);
    }
    // Abstract operations for the ReadableStream.
    function AcquireReadableStreamDefaultReader(stream) {
        return new ReadableStreamDefaultReader(stream);
    }
    // ReadableStream API exposed for controllers.
    function ReadableStreamAddReadRequest(stream, readRequest) {
        stream._reader._readRequests.push(readRequest);
    }
    function ReadableStreamFulfillReadRequest(stream, chunk, done) {
        const reader = stream._reader;
        const readRequest = reader._readRequests.shift();
        if (done) readRequest._closeSteps();
        else readRequest._chunkSteps(chunk);
    }
    function ReadableStreamGetNumReadRequests(stream) {
        return stream._reader._readRequests.length;
    }
    function ReadableStreamHasDefaultReader(stream) {
        const reader = stream._reader;
        if (reader === undefined) return false;
        if (!IsReadableStreamDefaultReader(reader)) return false;
        return true;
    }
    /**
     * A default reader vended by a {@link ReadableStream}.
     *
     * @public
     */ class ReadableStreamDefaultReader {
        constructor(stream){
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
        }
        /**
         * Returns a promise that will be fulfilled when the stream becomes closed,
         * or rejected if the stream ever errors or the reader's lock is released before the stream finishes closing.
         */ get closed() {
            if (!IsReadableStreamDefaultReader(this)) return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            return this._closedPromise;
        }
        /**
         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
         */ cancel(reason) {
            if (!IsReadableStreamDefaultReader(this)) return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            if (this._ownerReadableStream === undefined) return promiseRejectedWith(readerLockException("cancel"));
            return ReadableStreamReaderGenericCancel(this, reason);
        }
        /**
         * Returns a promise that allows access to the next chunk from the stream's internal queue, if available.
         *
         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
         */ read() {
            if (!IsReadableStreamDefaultReader(this)) return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            if (this._ownerReadableStream === undefined) return promiseRejectedWith(readerLockException("read from"));
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve, reject)=>{
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            const readRequest = {
                _chunkSteps: (chunk)=>resolvePromise({
                        value: chunk,
                        done: false
                    }),
                _closeSteps: ()=>resolvePromise({
                        value: undefined,
                        done: true
                    }),
                _errorSteps: (e)=>rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
        }
        /**
         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
         * from now on; otherwise, the reader will appear closed.
         *
         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
         * the reader's {@link ReadableStreamDefaultReader.read | read()} method has not yet been settled. Attempting to
         * do so will throw a `TypeError` and leave the reader locked to the stream.
         */ releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) throw defaultReaderBrandCheckException("releaseLock");
            if (this._ownerReadableStream === undefined) return;
            if (this._readRequests.length > 0) throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            ReadableStreamReaderGenericRelease(this);
        }
    }
    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
        cancel: {
            enumerable: true
        },
        read: {
            enumerable: true
        },
        releaseLock: {
            enumerable: true
        },
        closed: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultReader",
        configurable: true
    });
    // Abstract operations for the readers.
    function IsReadableStreamDefaultReader(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) return false;
        return x instanceof ReadableStreamDefaultReader;
    }
    function ReadableStreamDefaultReaderRead(reader, readRequest) {
        const stream = reader._ownerReadableStream;
        stream._disturbed = true;
        if (stream._state === "closed") readRequest._closeSteps();
        else if (stream._state === "errored") readRequest._errorSteps(stream._storedError);
        else stream._readableStreamController[PullSteps](readRequest);
    }
    // Helper functions for the ReadableStreamDefaultReader.
    function defaultReaderBrandCheckException(name) {
        return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
    }
    /// <reference lib="es2018.asynciterable" />
    /* eslint-disable @typescript-eslint/no-empty-function */ const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function*() {}).prototype);
    /// <reference lib="es2018.asynciterable" />
    class ReadableStreamAsyncIteratorImpl {
        constructor(reader, preventCancel){
            this._ongoingPromise = undefined;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
        }
        next() {
            const nextSteps = ()=>this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
        }
        return(value) {
            const returnSteps = ()=>this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
        }
        _nextSteps() {
            if (this._isFinished) return Promise.resolve({
                value: undefined,
                done: true
            });
            const reader = this._reader;
            if (reader._ownerReadableStream === undefined) return promiseRejectedWith(readerLockException("iterate"));
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve, reject)=>{
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            const readRequest = {
                _chunkSteps: (chunk)=>{
                    this._ongoingPromise = undefined;
                    // This needs to be delayed by one microtask, otherwise we stop pulling too early which breaks a test.
                    // FIXME Is this a bug in the specification, or in the test?
                    queueMicrotask(()=>resolvePromise({
                            value: chunk,
                            done: false
                        }));
                },
                _closeSteps: ()=>{
                    this._ongoingPromise = undefined;
                    this._isFinished = true;
                    ReadableStreamReaderGenericRelease(reader);
                    resolvePromise({
                        value: undefined,
                        done: true
                    });
                },
                _errorSteps: (reason)=>{
                    this._ongoingPromise = undefined;
                    this._isFinished = true;
                    ReadableStreamReaderGenericRelease(reader);
                    rejectPromise(reason);
                }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
        }
        _returnSteps(value) {
            if (this._isFinished) return Promise.resolve({
                value: value,
                done: true
            });
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === undefined) return promiseRejectedWith(readerLockException("finish iterating"));
            if (!this._preventCancel) {
                const result = ReadableStreamReaderGenericCancel(reader, value);
                ReadableStreamReaderGenericRelease(reader);
                return transformPromiseWith(result, ()=>({
                        value: value,
                        done: true
                    }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({
                value: value,
                done: true
            });
        }
    }
    const ReadableStreamAsyncIteratorPrototype = {
        next () {
            if (!IsReadableStreamAsyncIterator(this)) return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            return this._asyncIteratorImpl.next();
        },
        return (value) {
            if (!IsReadableStreamAsyncIterator(this)) return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            return this._asyncIteratorImpl.return(value);
        }
    };
    if (AsyncIteratorPrototype !== undefined) Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
    // Abstract operations for the ReadableStream.
    function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
        const reader = AcquireReadableStreamDefaultReader(stream);
        const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
        const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
        iterator._asyncIteratorImpl = impl;
        return iterator;
    }
    function IsReadableStreamAsyncIterator(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) return false;
        try {
            // noinspection SuspiciousTypeOfGuard
            return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
        } catch (_a) {
            return false;
        }
    }
    // Helper functions for the ReadableStream.
    function streamAsyncIteratorBrandCheckException(name) {
        return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
    }
    /// <reference lib="es2015.core" />
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN#Polyfill
    const NumberIsNaN = Number.isNaN || function(x) {
        // eslint-disable-next-line no-self-compare
        return x !== x;
    };
    function CreateArrayFromList(elements) {
        // We use arrays to represent lists, so this is basically a no-op.
        // Do a slice though just in case we happen to depend on the unique-ness.
        return elements.slice();
    }
    function CopyDataBlockBytes(dest, destOffset, src, srcOffset, n) {
        new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
    }
    // Not implemented correctly
    function TransferArrayBuffer(O) {
        return O;
    }
    // Not implemented correctly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function IsDetachedBuffer(O) {
        return false;
    }
    function ArrayBufferSlice(buffer, begin, end) {
        // ArrayBuffer.prototype.slice is not available on IE10
        // https://www.caniuse.com/mdn-javascript_builtins_arraybuffer_slice
        if (buffer.slice) return buffer.slice(begin, end);
        const length = end - begin;
        const slice = new ArrayBuffer(length);
        CopyDataBlockBytes(slice, 0, buffer, begin, length);
        return slice;
    }
    function IsNonNegativeNumber(v) {
        if (typeof v !== "number") return false;
        if (NumberIsNaN(v)) return false;
        if (v < 0) return false;
        return true;
    }
    function CloneAsUint8Array(O) {
        const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
        return new Uint8Array(buffer);
    }
    function DequeueValue(container) {
        const pair = container._queue.shift();
        container._queueTotalSize -= pair.size;
        if (container._queueTotalSize < 0) container._queueTotalSize = 0;
        return pair.value;
    }
    function EnqueueValueWithSize(container, value, size) {
        if (!IsNonNegativeNumber(size) || size === Infinity) throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
        container._queue.push({
            value: value,
            size: size
        });
        container._queueTotalSize += size;
    }
    function PeekQueueValue(container) {
        const pair = container._queue.peek();
        return pair.value;
    }
    function ResetQueue(container) {
        container._queue = new SimpleQueue();
        container._queueTotalSize = 0;
    }
    /**
     * A pull-into request in a {@link ReadableByteStreamController}.
     *
     * @public
     */ class ReadableStreamBYOBRequest {
        constructor(){
            throw new TypeError("Illegal constructor");
        }
        /**
         * Returns the view for writing in to, or `null` if the BYOB request has already been responded to.
         */ get view() {
            if (!IsReadableStreamBYOBRequest(this)) throw byobRequestBrandCheckException("view");
            return this._view;
        }
        respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) throw byobRequestBrandCheckException("respond");
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === undefined) throw new TypeError("This BYOB request has been invalidated");
            IsDetachedBuffer(this._view.buffer);
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
        }
        respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) throw byobRequestBrandCheckException("respondWithNewView");
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) throw new TypeError("You can only respond with array buffer views");
            if (this._associatedReadableByteStreamController === undefined) throw new TypeError("This BYOB request has been invalidated");
            IsDetachedBuffer(view.buffer);
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
        }
    }
    Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
        respond: {
            enumerable: true
        },
        respondWithNewView: {
            enumerable: true
        },
        view: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBRequest",
        configurable: true
    });
    /**
     * Allows control of a {@link ReadableStream | readable byte stream}'s state and internal queue.
     *
     * @public
     */ class ReadableByteStreamController {
        constructor(){
            throw new TypeError("Illegal constructor");
        }
        /**
         * Returns the current BYOB pull request, or `null` if there isn't one.
         */ get byobRequest() {
            if (!IsReadableByteStreamController(this)) throw byteStreamControllerBrandCheckException("byobRequest");
            return ReadableByteStreamControllerGetBYOBRequest(this);
        }
        /**
         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
         * over-full. An underlying byte source ought to use this information to determine when and how to apply backpressure.
         */ get desiredSize() {
            if (!IsReadableByteStreamController(this)) throw byteStreamControllerBrandCheckException("desiredSize");
            return ReadableByteStreamControllerGetDesiredSize(this);
        }
        /**
         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
         * the stream, but once those are read, the stream will become closed.
         */ close() {
            if (!IsReadableByteStreamController(this)) throw byteStreamControllerBrandCheckException("close");
            if (this._closeRequested) throw new TypeError("The stream has already been closed; do not close it again!");
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            ReadableByteStreamControllerClose(this);
        }
        enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) throw byteStreamControllerBrandCheckException("enqueue");
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) throw new TypeError("chunk must be an array buffer view");
            if (chunk.byteLength === 0) throw new TypeError("chunk must have non-zero byteLength");
            if (chunk.buffer.byteLength === 0) throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            if (this._closeRequested) throw new TypeError("stream is closed or draining");
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            ReadableByteStreamControllerEnqueue(this, chunk);
        }
        /**
         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
         */ error(e) {
            if (!IsReadableByteStreamController(this)) throw byteStreamControllerBrandCheckException("error");
            ReadableByteStreamControllerError(this, e);
        }
        /** @internal */ [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
        }
        /** @internal */ [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
                const entry = this._queue.shift();
                this._queueTotalSize -= entry.byteLength;
                ReadableByteStreamControllerHandleQueueDrain(this);
                const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
                readRequest._chunkSteps(view);
                return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== undefined) {
                let buffer;
                try {
                    buffer = new ArrayBuffer(autoAllocateChunkSize);
                } catch (bufferE) {
                    readRequest._errorSteps(bufferE);
                    return;
                }
                const pullIntoDescriptor = {
                    buffer: buffer,
                    bufferByteLength: autoAllocateChunkSize,
                    byteOffset: 0,
                    byteLength: autoAllocateChunkSize,
                    bytesFilled: 0,
                    elementSize: 1,
                    viewConstructor: Uint8Array,
                    readerType: "default"
                };
                this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
        }
    }
    Object.defineProperties(ReadableByteStreamController.prototype, {
        close: {
            enumerable: true
        },
        enqueue: {
            enumerable: true
        },
        error: {
            enumerable: true
        },
        byobRequest: {
            enumerable: true
        },
        desiredSize: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableByteStreamController",
        configurable: true
    });
    // Abstract operations for the ReadableByteStreamController.
    function IsReadableByteStreamController(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) return false;
        return x instanceof ReadableByteStreamController;
    }
    function IsReadableStreamBYOBRequest(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) return false;
        return x instanceof ReadableStreamBYOBRequest;
    }
    function ReadableByteStreamControllerCallPullIfNeeded(controller) {
        const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
        if (!shouldPull) return;
        if (controller._pulling) {
            controller._pullAgain = true;
            return;
        }
        controller._pulling = true;
        // TODO: Test controller argument
        const pullPromise = controller._pullAlgorithm();
        uponPromise(pullPromise, ()=>{
            controller._pulling = false;
            if (controller._pullAgain) {
                controller._pullAgain = false;
                ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
        }, (e)=>{
            ReadableByteStreamControllerError(controller, e);
        });
    }
    function ReadableByteStreamControllerClearPendingPullIntos(controller) {
        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
        controller._pendingPullIntos = new SimpleQueue();
    }
    function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
        let done = false;
        if (stream._state === "closed") done = true;
        const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
        if (pullIntoDescriptor.readerType === "default") ReadableStreamFulfillReadRequest(stream, filledView, done);
        else ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
    }
    function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
        const bytesFilled = pullIntoDescriptor.bytesFilled;
        const elementSize = pullIntoDescriptor.elementSize;
        return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
    }
    function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
        controller._queue.push({
            buffer: buffer,
            byteOffset: byteOffset,
            byteLength: byteLength
        });
        controller._queueTotalSize += byteLength;
    }
    function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
        const elementSize = pullIntoDescriptor.elementSize;
        const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
        const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
        const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
        const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
        let totalBytesToCopyRemaining = maxBytesToCopy;
        let ready = false;
        if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
        }
        const queue = controller._queue;
        while(totalBytesToCopyRemaining > 0){
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) queue.shift();
            else {
                headOfQueue.byteOffset += bytesToCopy;
                headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
        }
        return ready;
    }
    function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
        pullIntoDescriptor.bytesFilled += size;
    }
    function ReadableByteStreamControllerHandleQueueDrain(controller) {
        if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
        } else ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
        if (controller._byobRequest === null) return;
        controller._byobRequest._associatedReadableByteStreamController = undefined;
        controller._byobRequest._view = null;
        controller._byobRequest = null;
    }
    function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
        while(controller._pendingPullIntos.length > 0){
            if (controller._queueTotalSize === 0) return;
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
                ReadableByteStreamControllerShiftPendingPullInto(controller);
                ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
        }
    }
    function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
        const stream = controller._controlledReadableByteStream;
        let elementSize = 1;
        if (view.constructor !== DataView) elementSize = view.constructor.BYTES_PER_ELEMENT;
        const ctor = view.constructor;
        // try {
        const buffer = TransferArrayBuffer(view.buffer);
        // } catch (e) {
        //   readIntoRequest._errorSteps(e);
        //   return;
        // }
        const pullIntoDescriptor = {
            buffer: buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize: elementSize,
            viewConstructor: ctor,
            readerType: "byob"
        };
        if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            // No ReadableByteStreamControllerCallPullIfNeeded() call since:
            // - No change happens on desiredSize
            // - The source has already been notified of that there's at least 1 pending read(view)
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
        }
        if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
        }
        if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
                const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
                ReadableByteStreamControllerHandleQueueDrain(controller);
                readIntoRequest._chunkSteps(filledView);
                return;
            }
            if (controller._closeRequested) {
                const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
                ReadableByteStreamControllerError(controller, e);
                readIntoRequest._errorSteps(e);
                return;
            }
        }
        controller._pendingPullIntos.push(pullIntoDescriptor);
        ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
        const stream = controller._controlledReadableByteStream;
        if (ReadableStreamHasBYOBReader(stream)) while(ReadableStreamGetNumReadIntoRequests(stream) > 0){
            const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
            ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
        }
    }
    function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
        if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) return;
        ReadableByteStreamControllerShiftPendingPullInto(controller);
        const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
        if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
        }
        pullIntoDescriptor.bytesFilled -= remainderSize;
        ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    }
    function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
        const state = controller._controlledReadableByteStream._state;
        if (state === "closed") ReadableByteStreamControllerRespondInClosedState(controller);
        else ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerShiftPendingPullInto(controller) {
        const descriptor = controller._pendingPullIntos.shift();
        return descriptor;
    }
    function ReadableByteStreamControllerShouldCallPull(controller) {
        const stream = controller._controlledReadableByteStream;
        if (stream._state !== "readable") return false;
        if (controller._closeRequested) return false;
        if (!controller._started) return false;
        if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) return true;
        if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) return true;
        const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
        if (desiredSize > 0) return true;
        return false;
    }
    function ReadableByteStreamControllerClearAlgorithms(controller) {
        controller._pullAlgorithm = undefined;
        controller._cancelAlgorithm = undefined;
    }
    // A client of ReadableByteStreamController may use these functions directly to bypass state check.
    function ReadableByteStreamControllerClose(controller) {
        const stream = controller._controlledReadableByteStream;
        if (controller._closeRequested || stream._state !== "readable") return;
        if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
        }
        if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
                const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
                ReadableByteStreamControllerError(controller, e);
                throw e;
            }
        }
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamClose(stream);
    }
    function ReadableByteStreamControllerEnqueue(controller, chunk) {
        const stream = controller._controlledReadableByteStream;
        if (controller._closeRequested || stream._state !== "readable") return;
        const buffer = chunk.buffer;
        const byteOffset = chunk.byteOffset;
        const byteLength = chunk.byteLength;
        const transferredBuffer = TransferArrayBuffer(buffer);
        if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            IsDetachedBuffer(firstPendingPullInto.buffer);
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
        }
        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
        if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            else {
                if (controller._pendingPullIntos.length > 0) ReadableByteStreamControllerShiftPendingPullInto(controller);
                const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
                ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
        } else if (ReadableStreamHasBYOBReader(stream)) {
            // TODO: Ideally in this branch detaching should happen only if the buffer is not consumed fully.
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        } else ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerError(controller, e) {
        const stream = controller._controlledReadableByteStream;
        if (stream._state !== "readable") return;
        ReadableByteStreamControllerClearPendingPullIntos(controller);
        ResetQueue(controller);
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamError(stream, e);
    }
    function ReadableByteStreamControllerGetBYOBRequest(controller) {
        if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
        }
        return controller._byobRequest;
    }
    function ReadableByteStreamControllerGetDesiredSize(controller) {
        const state = controller._controlledReadableByteStream._state;
        if (state === "errored") return null;
        if (state === "closed") return 0;
        return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableByteStreamControllerRespond(controller, bytesWritten) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        const state = controller._controlledReadableByteStream._state;
        if (state === "closed") {
            if (bytesWritten !== 0) throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
        } else {
            if (bytesWritten === 0) throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) throw new RangeError("bytesWritten out of range");
        }
        firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
        ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
    }
    function ReadableByteStreamControllerRespondWithNewView(controller, view) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        const state = controller._controlledReadableByteStream._state;
        if (state === "closed") {
            if (view.byteLength !== 0) throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
        } else {
            if (view.byteLength === 0) throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
        }
        if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) throw new RangeError("The region specified by view does not match byobRequest");
        if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) throw new RangeError("The buffer of view has different capacity than byobRequest");
        if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) throw new RangeError("The region specified by view is larger than byobRequest");
        const viewByteLength = view.byteLength;
        firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
        ReadableByteStreamControllerRespondInternal(controller, viewByteLength);
    }
    function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
        controller._controlledReadableByteStream = stream;
        controller._pullAgain = false;
        controller._pulling = false;
        controller._byobRequest = null;
        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
        controller._queue = controller._queueTotalSize = undefined;
        ResetQueue(controller);
        controller._closeRequested = false;
        controller._started = false;
        controller._strategyHWM = highWaterMark;
        controller._pullAlgorithm = pullAlgorithm;
        controller._cancelAlgorithm = cancelAlgorithm;
        controller._autoAllocateChunkSize = autoAllocateChunkSize;
        controller._pendingPullIntos = new SimpleQueue();
        stream._readableStreamController = controller;
        const startResult = startAlgorithm();
        uponPromise(promiseResolvedWith(startResult), ()=>{
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
        }, (r)=>{
            ReadableByteStreamControllerError(controller, r);
        });
    }
    function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
        const controller = Object.create(ReadableByteStreamController.prototype);
        let startAlgorithm = ()=>undefined;
        let pullAlgorithm = ()=>promiseResolvedWith(undefined);
        let cancelAlgorithm = ()=>promiseResolvedWith(undefined);
        if (underlyingByteSource.start !== undefined) startAlgorithm = ()=>underlyingByteSource.start(controller);
        if (underlyingByteSource.pull !== undefined) pullAlgorithm = ()=>underlyingByteSource.pull(controller);
        if (underlyingByteSource.cancel !== undefined) cancelAlgorithm = (reason)=>underlyingByteSource.cancel(reason);
        const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
        if (autoAllocateChunkSize === 0) throw new TypeError("autoAllocateChunkSize must be greater than 0");
        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
    }
    function SetUpReadableStreamBYOBRequest(request, controller, view) {
        request._associatedReadableByteStreamController = controller;
        request._view = view;
    }
    // Helper functions for the ReadableStreamBYOBRequest.
    function byobRequestBrandCheckException(name) {
        return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
    }
    // Helper functions for the ReadableByteStreamController.
    function byteStreamControllerBrandCheckException(name) {
        return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
    }
    // Abstract operations for the ReadableStream.
    function AcquireReadableStreamBYOBReader(stream) {
        return new ReadableStreamBYOBReader(stream);
    }
    // ReadableStream API exposed for controllers.
    function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
        stream._reader._readIntoRequests.push(readIntoRequest);
    }
    function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
        const reader = stream._reader;
        const readIntoRequest = reader._readIntoRequests.shift();
        if (done) readIntoRequest._closeSteps(chunk);
        else readIntoRequest._chunkSteps(chunk);
    }
    function ReadableStreamGetNumReadIntoRequests(stream) {
        return stream._reader._readIntoRequests.length;
    }
    function ReadableStreamHasBYOBReader(stream) {
        const reader = stream._reader;
        if (reader === undefined) return false;
        if (!IsReadableStreamBYOBReader(reader)) return false;
        return true;
    }
    /**
     * A BYOB reader vended by a {@link ReadableStream}.
     *
     * @public
     */ class ReadableStreamBYOBReader {
        constructor(stream){
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            if (!IsReadableByteStreamController(stream._readableStreamController)) throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
        }
        /**
         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
         * the reader's lock is released before the stream finishes closing.
         */ get closed() {
            if (!IsReadableStreamBYOBReader(this)) return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            return this._closedPromise;
        }
        /**
         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
         */ cancel(reason) {
            if (!IsReadableStreamBYOBReader(this)) return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            if (this._ownerReadableStream === undefined) return promiseRejectedWith(readerLockException("cancel"));
            return ReadableStreamReaderGenericCancel(this, reason);
        }
        /**
         * Attempts to reads bytes into view, and returns a promise resolved with the result.
         *
         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
         */ read(view) {
            if (!IsReadableStreamBYOBReader(this)) return promiseRejectedWith(byobReaderBrandCheckException("read"));
            if (!ArrayBuffer.isView(view)) return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            if (view.byteLength === 0) return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            if (view.buffer.byteLength === 0) return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            IsDetachedBuffer(view.buffer);
            if (this._ownerReadableStream === undefined) return promiseRejectedWith(readerLockException("read from"));
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve, reject)=>{
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            const readIntoRequest = {
                _chunkSteps: (chunk)=>resolvePromise({
                        value: chunk,
                        done: false
                    }),
                _closeSteps: (chunk)=>resolvePromise({
                        value: chunk,
                        done: true
                    }),
                _errorSteps: (e)=>rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
        }
        /**
         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
         * from now on; otherwise, the reader will appear closed.
         *
         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
         * the reader's {@link ReadableStreamBYOBReader.read | read()} method has not yet been settled. Attempting to
         * do so will throw a `TypeError` and leave the reader locked to the stream.
         */ releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) throw byobReaderBrandCheckException("releaseLock");
            if (this._ownerReadableStream === undefined) return;
            if (this._readIntoRequests.length > 0) throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            ReadableStreamReaderGenericRelease(this);
        }
    }
    Object.defineProperties(ReadableStreamBYOBReader.prototype, {
        cancel: {
            enumerable: true
        },
        read: {
            enumerable: true
        },
        releaseLock: {
            enumerable: true
        },
        closed: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBReader",
        configurable: true
    });
    // Abstract operations for the readers.
    function IsReadableStreamBYOBReader(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) return false;
        return x instanceof ReadableStreamBYOBReader;
    }
    function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
        const stream = reader._ownerReadableStream;
        stream._disturbed = true;
        if (stream._state === "errored") readIntoRequest._errorSteps(stream._storedError);
        else ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
    }
    // Helper functions for the ReadableStreamBYOBReader.
    function byobReaderBrandCheckException(name) {
        return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
    }
    function ExtractHighWaterMark(strategy, defaultHWM) {
        const { highWaterMark: highWaterMark  } = strategy;
        if (highWaterMark === undefined) return defaultHWM;
        if (NumberIsNaN(highWaterMark) || highWaterMark < 0) throw new RangeError("Invalid highWaterMark");
        return highWaterMark;
    }
    function ExtractSizeAlgorithm(strategy) {
        const { size: size  } = strategy;
        if (!size) return ()=>1;
        return size;
    }
    function convertQueuingStrategy(init, context) {
        assertDictionary(init, context);
        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
        const size = init === null || init === void 0 ? void 0 : init.size;
        return {
            highWaterMark: highWaterMark === undefined ? undefined : convertUnrestrictedDouble(highWaterMark),
            size: size === undefined ? undefined : convertQueuingStrategySize(size, `${context} has member 'size' that`)
        };
    }
    function convertQueuingStrategySize(fn, context) {
        assertFunction(fn, context);
        return (chunk)=>convertUnrestrictedDouble(fn(chunk));
    }
    function convertUnderlyingSink(original, context) {
        assertDictionary(original, context);
        const abort = original === null || original === void 0 ? void 0 : original.abort;
        const close = original === null || original === void 0 ? void 0 : original.close;
        const start = original === null || original === void 0 ? void 0 : original.start;
        const type = original === null || original === void 0 ? void 0 : original.type;
        const write = original === null || original === void 0 ? void 0 : original.write;
        return {
            abort: abort === undefined ? undefined : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === undefined ? undefined : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === undefined ? undefined : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === undefined ? undefined : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type: type
        };
    }
    function convertUnderlyingSinkAbortCallback(fn, original, context) {
        assertFunction(fn, context);
        return (reason)=>promiseCall(fn, original, [
                reason
            ]);
    }
    function convertUnderlyingSinkCloseCallback(fn, original, context) {
        assertFunction(fn, context);
        return ()=>promiseCall(fn, original, []);
    }
    function convertUnderlyingSinkStartCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller)=>reflectCall(fn, original, [
                controller
            ]);
    }
    function convertUnderlyingSinkWriteCallback(fn, original, context) {
        assertFunction(fn, context);
        return (chunk, controller)=>promiseCall(fn, original, [
                chunk,
                controller
            ]);
    }
    function assertWritableStream(x, context) {
        if (!IsWritableStream(x)) throw new TypeError(`${context} is not a WritableStream.`);
    }
    function isAbortSignal(value) {
        if (typeof value !== "object" || value === null) return false;
        try {
            return typeof value.aborted === "boolean";
        } catch (_a) {
            // AbortSignal.prototype.aborted throws if its brand check fails
            return false;
        }
    }
    const supportsAbortController = typeof AbortController === "function";
    /**
     * Construct a new AbortController, if supported by the platform.
     *
     * @internal
     */ function createAbortController() {
        if (supportsAbortController) return new AbortController();
        return undefined;
    }
    /**
     * A writable stream represents a destination for data, into which you can write.
     *
     * @public
     */ class WritableStream {
        constructor(rawUnderlyingSink = {}, rawStrategy = {}){
            if (rawUnderlyingSink === undefined) rawUnderlyingSink = null;
            else assertObject(rawUnderlyingSink, "First parameter");
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== undefined) throw new RangeError("Invalid type is specified");
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
        }
        /**
         * Returns whether or not the writable stream is locked to a writer.
         */ get locked() {
            if (!IsWritableStream(this)) throw streamBrandCheckException$2("locked");
            return IsWritableStreamLocked(this);
        }
        /**
         * Aborts the stream, signaling that the producer can no longer successfully write to the stream and it is to be
         * immediately moved to an errored state, with any queued-up writes discarded. This will also execute any abort
         * mechanism of the underlying sink.
         *
         * The returned promise will fulfill if the stream shuts down successfully, or reject if the underlying sink signaled
         * that there was an error doing so. Additionally, it will reject with a `TypeError` (without attempting to cancel
         * the stream) if the stream is currently locked.
         */ abort(reason) {
            if (!IsWritableStream(this)) return promiseRejectedWith(streamBrandCheckException$2("abort"));
            if (IsWritableStreamLocked(this)) return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            return WritableStreamAbort(this, reason);
        }
        /**
         * Closes the stream. The underlying sink will finish processing any previously-written chunks, before invoking its
         * close behavior. During this time any further attempts to write will fail (without erroring the stream).
         *
         * The method returns a promise that will fulfill if all remaining chunks are successfully written and the stream
         * successfully closes, or rejects if an error is encountered during this process. Additionally, it will reject with
         * a `TypeError` (without attempting to cancel the stream) if the stream is currently locked.
         */ close() {
            if (!IsWritableStream(this)) return promiseRejectedWith(streamBrandCheckException$2("close"));
            if (IsWritableStreamLocked(this)) return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            if (WritableStreamCloseQueuedOrInFlight(this)) return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            return WritableStreamClose(this);
        }
        /**
         * Creates a {@link WritableStreamDefaultWriter | writer} and locks the stream to the new writer. While the stream
         * is locked, no other writer can be acquired until this one is released.
         *
         * This functionality is especially useful for creating abstractions that desire the ability to write to a stream
         * without interruption or interleaving. By getting a writer for the stream, you can ensure nobody else can write at
         * the same time, which would cause the resulting written data to be unpredictable and probably useless.
         */ getWriter() {
            if (!IsWritableStream(this)) throw streamBrandCheckException$2("getWriter");
            return AcquireWritableStreamDefaultWriter(this);
        }
    }
    Object.defineProperties(WritableStream.prototype, {
        abort: {
            enumerable: true
        },
        close: {
            enumerable: true
        },
        getWriter: {
            enumerable: true
        },
        locked: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStream",
        configurable: true
    });
    // Abstract operations for the WritableStream.
    function AcquireWritableStreamDefaultWriter(stream) {
        return new WritableStreamDefaultWriter(stream);
    }
    // Throws if and only if startAlgorithm throws.
    function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = ()=>1) {
        const stream = Object.create(WritableStream.prototype);
        InitializeWritableStream(stream);
        const controller = Object.create(WritableStreamDefaultController.prototype);
        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        return stream;
    }
    function InitializeWritableStream(stream) {
        stream._state = "writable";
        // The error that will be reported by new method calls once the state becomes errored. Only set when [[state]] is
        // 'erroring' or 'errored'. May be set to an undefined value.
        stream._storedError = undefined;
        stream._writer = undefined;
        // Initialize to undefined first because the constructor of the controller checks this
        // variable to validate the caller.
        stream._writableStreamController = undefined;
        // This queue is placed here instead of the writer class in order to allow for passing a writer to the next data
        // producer without waiting for the queued writes to finish.
        stream._writeRequests = new SimpleQueue();
        // Write requests are removed from _writeRequests when write() is called on the underlying sink. This prevents
        // them from being erroneously rejected on error. If a write() call is in-flight, the request is stored here.
        stream._inFlightWriteRequest = undefined;
        // The promise that was returned from writer.close(). Stored here because it may be fulfilled after the writer
        // has been detached.
        stream._closeRequest = undefined;
        // Close request is removed from _closeRequest when close() is called on the underlying sink. This prevents it
        // from being erroneously rejected on error. If a close() call is in-flight, the request is stored here.
        stream._inFlightCloseRequest = undefined;
        // The promise that was returned from writer.abort(). This may also be fulfilled after the writer has detached.
        stream._pendingAbortRequest = undefined;
        // The backpressure signal set by the controller.
        stream._backpressure = false;
    }
    function IsWritableStream(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) return false;
        return x instanceof WritableStream;
    }
    function IsWritableStreamLocked(stream) {
        if (stream._writer === undefined) return false;
        return true;
    }
    function WritableStreamAbort(stream, reason) {
        var _a;
        if (stream._state === "closed" || stream._state === "errored") return promiseResolvedWith(undefined);
        stream._writableStreamController._abortReason = reason;
        (_a = stream._writableStreamController._abortController) === null || _a === void 0 || _a.abort();
        // TypeScript narrows the type of `stream._state` down to 'writable' | 'erroring',
        // but it doesn't know that signaling abort runs author code that might have changed the state.
        // Widen the type again by casting to WritableStreamState.
        const state = stream._state;
        if (state === "closed" || state === "errored") return promiseResolvedWith(undefined);
        if (stream._pendingAbortRequest !== undefined) return stream._pendingAbortRequest._promise;
        let wasAlreadyErroring = false;
        if (state === "erroring") {
            wasAlreadyErroring = true;
            // reason will not be used, so don't keep a reference to it.
            reason = undefined;
        }
        const promise = newPromise((resolve, reject)=>{
            stream._pendingAbortRequest = {
                _promise: undefined,
                _resolve: resolve,
                _reject: reject,
                _reason: reason,
                _wasAlreadyErroring: wasAlreadyErroring
            };
        });
        stream._pendingAbortRequest._promise = promise;
        if (!wasAlreadyErroring) WritableStreamStartErroring(stream, reason);
        return promise;
    }
    function WritableStreamClose(stream) {
        const state = stream._state;
        if (state === "closed" || state === "errored") return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
        const promise = newPromise((resolve, reject)=>{
            const closeRequest = {
                _resolve: resolve,
                _reject: reject
            };
            stream._closeRequest = closeRequest;
        });
        const writer = stream._writer;
        if (writer !== undefined && stream._backpressure && state === "writable") defaultWriterReadyPromiseResolve(writer);
        WritableStreamDefaultControllerClose(stream._writableStreamController);
        return promise;
    }
    // WritableStream API exposed for controllers.
    function WritableStreamAddWriteRequest(stream) {
        const promise = newPromise((resolve, reject)=>{
            const writeRequest = {
                _resolve: resolve,
                _reject: reject
            };
            stream._writeRequests.push(writeRequest);
        });
        return promise;
    }
    function WritableStreamDealWithRejection(stream, error) {
        const state = stream._state;
        if (state === "writable") {
            WritableStreamStartErroring(stream, error);
            return;
        }
        WritableStreamFinishErroring(stream);
    }
    function WritableStreamStartErroring(stream, reason) {
        const controller = stream._writableStreamController;
        stream._state = "erroring";
        stream._storedError = reason;
        const writer = stream._writer;
        if (writer !== undefined) WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
        if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) WritableStreamFinishErroring(stream);
    }
    function WritableStreamFinishErroring(stream) {
        stream._state = "errored";
        stream._writableStreamController[ErrorSteps]();
        const storedError = stream._storedError;
        stream._writeRequests.forEach((writeRequest)=>{
            writeRequest._reject(storedError);
        });
        stream._writeRequests = new SimpleQueue();
        if (stream._pendingAbortRequest === undefined) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
        }
        const abortRequest = stream._pendingAbortRequest;
        stream._pendingAbortRequest = undefined;
        if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
        }
        const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
        uponPromise(promise, ()=>{
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        }, (reason)=>{
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        });
    }
    function WritableStreamFinishInFlightWrite(stream) {
        stream._inFlightWriteRequest._resolve(undefined);
        stream._inFlightWriteRequest = undefined;
    }
    function WritableStreamFinishInFlightWriteWithError(stream, error) {
        stream._inFlightWriteRequest._reject(error);
        stream._inFlightWriteRequest = undefined;
        WritableStreamDealWithRejection(stream, error);
    }
    function WritableStreamFinishInFlightClose(stream) {
        stream._inFlightCloseRequest._resolve(undefined);
        stream._inFlightCloseRequest = undefined;
        const state = stream._state;
        if (state === "erroring") {
            // The error was too late to do anything, so it is ignored.
            stream._storedError = undefined;
            if (stream._pendingAbortRequest !== undefined) {
                stream._pendingAbortRequest._resolve();
                stream._pendingAbortRequest = undefined;
            }
        }
        stream._state = "closed";
        const writer = stream._writer;
        if (writer !== undefined) defaultWriterClosedPromiseResolve(writer);
    }
    function WritableStreamFinishInFlightCloseWithError(stream, error) {
        stream._inFlightCloseRequest._reject(error);
        stream._inFlightCloseRequest = undefined;
        // Never execute sink abort() after sink close().
        if (stream._pendingAbortRequest !== undefined) {
            stream._pendingAbortRequest._reject(error);
            stream._pendingAbortRequest = undefined;
        }
        WritableStreamDealWithRejection(stream, error);
    }
    // TODO(ricea): Fix alphabetical order.
    function WritableStreamCloseQueuedOrInFlight(stream) {
        if (stream._closeRequest === undefined && stream._inFlightCloseRequest === undefined) return false;
        return true;
    }
    function WritableStreamHasOperationMarkedInFlight(stream) {
        if (stream._inFlightWriteRequest === undefined && stream._inFlightCloseRequest === undefined) return false;
        return true;
    }
    function WritableStreamMarkCloseRequestInFlight(stream) {
        stream._inFlightCloseRequest = stream._closeRequest;
        stream._closeRequest = undefined;
    }
    function WritableStreamMarkFirstWriteRequestInFlight(stream) {
        stream._inFlightWriteRequest = stream._writeRequests.shift();
    }
    function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
        if (stream._closeRequest !== undefined) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = undefined;
        }
        const writer = stream._writer;
        if (writer !== undefined) defaultWriterClosedPromiseReject(writer, stream._storedError);
    }
    function WritableStreamUpdateBackpressure(stream, backpressure) {
        const writer = stream._writer;
        if (writer !== undefined && backpressure !== stream._backpressure) {
            if (backpressure) defaultWriterReadyPromiseReset(writer);
            else defaultWriterReadyPromiseResolve(writer);
        }
        stream._backpressure = backpressure;
    }
    /**
     * A default writer vended by a {@link WritableStream}.
     *
     * @public
     */ class WritableStreamDefaultWriter {
        constructor(stream){
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
                if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) defaultWriterReadyPromiseInitialize(this);
                else defaultWriterReadyPromiseInitializeAsResolved(this);
                defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
                defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
                defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
                defaultWriterReadyPromiseInitializeAsResolved(this);
                defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
                const storedError = stream._storedError;
                defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
                defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
        }
        /**
         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
         * the writer’s lock is released before the stream finishes closing.
         */ get closed() {
            if (!IsWritableStreamDefaultWriter(this)) return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            return this._closedPromise;
        }
        /**
         * Returns the desired size to fill the stream’s internal queue. It can be negative, if the queue is over-full.
         * A producer can use this information to determine the right amount of data to write.
         *
         * It will be `null` if the stream cannot be successfully written to (due to either being errored, or having an abort
         * queued up). It will return zero if the stream is closed. And the getter will throw an exception if invoked when
         * the writer’s lock is released.
         */ get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) throw defaultWriterBrandCheckException("desiredSize");
            if (this._ownerWritableStream === undefined) throw defaultWriterLockException("desiredSize");
            return WritableStreamDefaultWriterGetDesiredSize(this);
        }
        /**
         * Returns a promise that will be fulfilled when the desired size to fill the stream’s internal queue transitions
         * from non-positive to positive, signaling that it is no longer applying backpressure. Once the desired size dips
         * back to zero or below, the getter will return a new promise that stays pending until the next transition.
         *
         * If the stream becomes errored or aborted, or the writer’s lock is released, the returned promise will become
         * rejected.
         */ get ready() {
            if (!IsWritableStreamDefaultWriter(this)) return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            return this._readyPromise;
        }
        /**
         * If the reader is active, behaves the same as {@link WritableStream.abort | stream.abort(reason)}.
         */ abort(reason) {
            if (!IsWritableStreamDefaultWriter(this)) return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            if (this._ownerWritableStream === undefined) return promiseRejectedWith(defaultWriterLockException("abort"));
            return WritableStreamDefaultWriterAbort(this, reason);
        }
        /**
         * If the reader is active, behaves the same as {@link WritableStream.close | stream.close()}.
         */ close() {
            if (!IsWritableStreamDefaultWriter(this)) return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            const stream = this._ownerWritableStream;
            if (stream === undefined) return promiseRejectedWith(defaultWriterLockException("close"));
            if (WritableStreamCloseQueuedOrInFlight(stream)) return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            return WritableStreamDefaultWriterClose(this);
        }
        /**
         * Releases the writer’s lock on the corresponding stream. After the lock is released, the writer is no longer active.
         * If the associated stream is errored when the lock is released, the writer will appear errored in the same way from
         * now on; otherwise, the writer will appear closed.
         *
         * Note that the lock can still be released even if some ongoing writes have not yet finished (i.e. even if the
         * promises returned from previous calls to {@link WritableStreamDefaultWriter.write | write()} have not yet settled).
         * It’s not necessary to hold the lock on the writer for the duration of the write; the lock instead simply prevents
         * other producers from writing in an interleaved manner.
         */ releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) throw defaultWriterBrandCheckException("releaseLock");
            const stream = this._ownerWritableStream;
            if (stream === undefined) return;
            WritableStreamDefaultWriterRelease(this);
        }
        write(chunk) {
            if (!IsWritableStreamDefaultWriter(this)) return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            if (this._ownerWritableStream === undefined) return promiseRejectedWith(defaultWriterLockException("write to"));
            return WritableStreamDefaultWriterWrite(this, chunk);
        }
    }
    Object.defineProperties(WritableStreamDefaultWriter.prototype, {
        abort: {
            enumerable: true
        },
        close: {
            enumerable: true
        },
        releaseLock: {
            enumerable: true
        },
        write: {
            enumerable: true
        },
        closed: {
            enumerable: true
        },
        desiredSize: {
            enumerable: true
        },
        ready: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultWriter",
        configurable: true
    });
    // Abstract operations for the WritableStreamDefaultWriter.
    function IsWritableStreamDefaultWriter(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) return false;
        return x instanceof WritableStreamDefaultWriter;
    }
    // A client of WritableStreamDefaultWriter may use these functions directly to bypass state check.
    function WritableStreamDefaultWriterAbort(writer, reason) {
        const stream = writer._ownerWritableStream;
        return WritableStreamAbort(stream, reason);
    }
    function WritableStreamDefaultWriterClose(writer) {
        const stream = writer._ownerWritableStream;
        return WritableStreamClose(stream);
    }
    function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
        const stream = writer._ownerWritableStream;
        const state = stream._state;
        if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") return promiseResolvedWith(undefined);
        if (state === "errored") return promiseRejectedWith(stream._storedError);
        return WritableStreamDefaultWriterClose(writer);
    }
    function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error) {
        if (writer._closedPromiseState === "pending") defaultWriterClosedPromiseReject(writer, error);
        else defaultWriterClosedPromiseResetToRejected(writer, error);
    }
    function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error) {
        if (writer._readyPromiseState === "pending") defaultWriterReadyPromiseReject(writer, error);
        else defaultWriterReadyPromiseResetToRejected(writer, error);
    }
    function WritableStreamDefaultWriterGetDesiredSize(writer) {
        const stream = writer._ownerWritableStream;
        const state = stream._state;
        if (state === "errored" || state === "erroring") return null;
        if (state === "closed") return 0;
        return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
    }
    function WritableStreamDefaultWriterRelease(writer) {
        const stream = writer._ownerWritableStream;
        const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
        // The state transitions to "errored" before the sink abort() method runs, but the writer.closed promise is not
        // rejected until afterwards. This means that simply testing state will not work.
        WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
        stream._writer = undefined;
        writer._ownerWritableStream = undefined;
    }
    function WritableStreamDefaultWriterWrite(writer, chunk) {
        const stream = writer._ownerWritableStream;
        const controller = stream._writableStreamController;
        const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
        if (stream !== writer._ownerWritableStream) return promiseRejectedWith(defaultWriterLockException("write to"));
        const state = stream._state;
        if (state === "errored") return promiseRejectedWith(stream._storedError);
        if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
        if (state === "erroring") return promiseRejectedWith(stream._storedError);
        const promise = WritableStreamAddWriteRequest(stream);
        WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
        return promise;
    }
    const closeSentinel = {};
    /**
     * Allows control of a {@link WritableStream | writable stream}'s state and internal queue.
     *
     * @public
     */ class WritableStreamDefaultController {
        constructor(){
            throw new TypeError("Illegal constructor");
        }
        /**
         * The reason which was passed to `WritableStream.abort(reason)` when the stream was aborted.
         *
         * @deprecated
         *  This property has been removed from the specification, see https://github.com/whatwg/streams/pull/1177.
         *  Use {@link WritableStreamDefaultController.signal}'s `reason` instead.
         */ get abortReason() {
            if (!IsWritableStreamDefaultController(this)) throw defaultControllerBrandCheckException$2("abortReason");
            return this._abortReason;
        }
        /**
         * An `AbortSignal` that can be used to abort the pending write or close operation when the stream is aborted.
         */ get signal() {
            if (!IsWritableStreamDefaultController(this)) throw defaultControllerBrandCheckException$2("signal");
            if (this._abortController === undefined) // Older browsers or older Node versions may not support `AbortController` or `AbortSignal`.
            // We don't want to bundle and ship an `AbortController` polyfill together with our polyfill,
            // so instead we only implement support for `signal` if we find a global `AbortController` constructor.
            throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            return this._abortController.signal;
        }
        /**
         * Closes the controlled writable stream, making all future interactions with it fail with the given error `e`.
         *
         * This method is rarely used, since usually it suffices to return a rejected promise from one of the underlying
         * sink's methods. However, it can be useful for suddenly shutting down a stream in response to an event outside the
         * normal lifecycle of interactions with the underlying sink.
         */ error(e) {
            if (!IsWritableStreamDefaultController(this)) throw defaultControllerBrandCheckException$2("error");
            const state = this._controlledWritableStream._state;
            if (state !== "writable") // The stream is closed, errored or will be soon. The sink can't do anything useful if it gets an error here, so
            // just treat it as a no-op.
            return;
            WritableStreamDefaultControllerError(this, e);
        }
        /** @internal */ [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
        }
        /** @internal */ [ErrorSteps]() {
            ResetQueue(this);
        }
    }
    Object.defineProperties(WritableStreamDefaultController.prototype, {
        abortReason: {
            enumerable: true
        },
        signal: {
            enumerable: true
        },
        error: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultController",
        configurable: true
    });
    // Abstract operations implementing interface required by the WritableStream.
    function IsWritableStreamDefaultController(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) return false;
        return x instanceof WritableStreamDefaultController;
    }
    function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
        controller._controlledWritableStream = stream;
        stream._writableStreamController = controller;
        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
        controller._queue = undefined;
        controller._queueTotalSize = undefined;
        ResetQueue(controller);
        controller._abortReason = undefined;
        controller._abortController = createAbortController();
        controller._started = false;
        controller._strategySizeAlgorithm = sizeAlgorithm;
        controller._strategyHWM = highWaterMark;
        controller._writeAlgorithm = writeAlgorithm;
        controller._closeAlgorithm = closeAlgorithm;
        controller._abortAlgorithm = abortAlgorithm;
        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
        WritableStreamUpdateBackpressure(stream, backpressure);
        const startResult = startAlgorithm();
        const startPromise = promiseResolvedWith(startResult);
        uponPromise(startPromise, ()=>{
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }, (r)=>{
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
        });
    }
    function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
        const controller = Object.create(WritableStreamDefaultController.prototype);
        let startAlgorithm = ()=>undefined;
        let writeAlgorithm = ()=>promiseResolvedWith(undefined);
        let closeAlgorithm = ()=>promiseResolvedWith(undefined);
        let abortAlgorithm = ()=>promiseResolvedWith(undefined);
        if (underlyingSink.start !== undefined) startAlgorithm = ()=>underlyingSink.start(controller);
        if (underlyingSink.write !== undefined) writeAlgorithm = (chunk)=>underlyingSink.write(chunk, controller);
        if (underlyingSink.close !== undefined) closeAlgorithm = ()=>underlyingSink.close();
        if (underlyingSink.abort !== undefined) abortAlgorithm = (reason)=>underlyingSink.abort(reason);
        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
    }
    // ClearAlgorithms may be called twice. Erroring the same stream in multiple ways will often result in redundant calls.
    function WritableStreamDefaultControllerClearAlgorithms(controller) {
        controller._writeAlgorithm = undefined;
        controller._closeAlgorithm = undefined;
        controller._abortAlgorithm = undefined;
        controller._strategySizeAlgorithm = undefined;
    }
    function WritableStreamDefaultControllerClose(controller) {
        EnqueueValueWithSize(controller, closeSentinel, 0);
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
        try {
            return controller._strategySizeAlgorithm(chunk);
        } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
        }
    }
    function WritableStreamDefaultControllerGetDesiredSize(controller) {
        return controller._strategyHWM - controller._queueTotalSize;
    }
    function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
        try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
        } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
        }
        const stream = controller._controlledWritableStream;
        if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
        }
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    // Abstract operations for the WritableStreamDefaultController.
    function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
        const stream = controller._controlledWritableStream;
        if (!controller._started) return;
        if (stream._inFlightWriteRequest !== undefined) return;
        const state = stream._state;
        if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
        }
        if (controller._queue.length === 0) return;
        const value = PeekQueueValue(controller);
        if (value === closeSentinel) WritableStreamDefaultControllerProcessClose(controller);
        else WritableStreamDefaultControllerProcessWrite(controller, value);
    }
    function WritableStreamDefaultControllerErrorIfNeeded(controller, error) {
        if (controller._controlledWritableStream._state === "writable") WritableStreamDefaultControllerError(controller, error);
    }
    function WritableStreamDefaultControllerProcessClose(controller) {
        const stream = controller._controlledWritableStream;
        WritableStreamMarkCloseRequestInFlight(stream);
        DequeueValue(controller);
        const sinkClosePromise = controller._closeAlgorithm();
        WritableStreamDefaultControllerClearAlgorithms(controller);
        uponPromise(sinkClosePromise, ()=>{
            WritableStreamFinishInFlightClose(stream);
        }, (reason)=>{
            WritableStreamFinishInFlightCloseWithError(stream, reason);
        });
    }
    function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
        const stream = controller._controlledWritableStream;
        WritableStreamMarkFirstWriteRequestInFlight(stream);
        const sinkWritePromise = controller._writeAlgorithm(chunk);
        uponPromise(sinkWritePromise, ()=>{
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
                const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
                WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }, (reason)=>{
            if (stream._state === "writable") WritableStreamDefaultControllerClearAlgorithms(controller);
            WritableStreamFinishInFlightWriteWithError(stream, reason);
        });
    }
    function WritableStreamDefaultControllerGetBackpressure(controller) {
        const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
        return desiredSize <= 0;
    }
    // A client of WritableStreamDefaultController may use these functions directly to bypass state check.
    function WritableStreamDefaultControllerError(controller, error) {
        const stream = controller._controlledWritableStream;
        WritableStreamDefaultControllerClearAlgorithms(controller);
        WritableStreamStartErroring(stream, error);
    }
    // Helper functions for the WritableStream.
    function streamBrandCheckException$2(name) {
        return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
    }
    // Helper functions for the WritableStreamDefaultController.
    function defaultControllerBrandCheckException$2(name) {
        return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
    }
    // Helper functions for the WritableStreamDefaultWriter.
    function defaultWriterBrandCheckException(name) {
        return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
    }
    function defaultWriterLockException(name) {
        return new TypeError("Cannot " + name + " a stream using a released writer");
    }
    function defaultWriterClosedPromiseInitialize(writer) {
        writer._closedPromise = newPromise((resolve, reject)=>{
            writer._closedPromise_resolve = resolve;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
        });
    }
    function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
        defaultWriterClosedPromiseInitialize(writer);
        defaultWriterClosedPromiseReject(writer, reason);
    }
    function defaultWriterClosedPromiseInitializeAsResolved(writer) {
        defaultWriterClosedPromiseInitialize(writer);
        defaultWriterClosedPromiseResolve(writer);
    }
    function defaultWriterClosedPromiseReject(writer, reason) {
        if (writer._closedPromise_reject === undefined) return;
        setPromiseIsHandledToTrue(writer._closedPromise);
        writer._closedPromise_reject(reason);
        writer._closedPromise_resolve = undefined;
        writer._closedPromise_reject = undefined;
        writer._closedPromiseState = "rejected";
    }
    function defaultWriterClosedPromiseResetToRejected(writer, reason) {
        defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterClosedPromiseResolve(writer) {
        if (writer._closedPromise_resolve === undefined) return;
        writer._closedPromise_resolve(undefined);
        writer._closedPromise_resolve = undefined;
        writer._closedPromise_reject = undefined;
        writer._closedPromiseState = "resolved";
    }
    function defaultWriterReadyPromiseInitialize(writer) {
        writer._readyPromise = newPromise((resolve, reject)=>{
            writer._readyPromise_resolve = resolve;
            writer._readyPromise_reject = reject;
        });
        writer._readyPromiseState = "pending";
    }
    function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
        defaultWriterReadyPromiseInitialize(writer);
        defaultWriterReadyPromiseReject(writer, reason);
    }
    function defaultWriterReadyPromiseInitializeAsResolved(writer) {
        defaultWriterReadyPromiseInitialize(writer);
        defaultWriterReadyPromiseResolve(writer);
    }
    function defaultWriterReadyPromiseReject(writer, reason) {
        if (writer._readyPromise_reject === undefined) return;
        setPromiseIsHandledToTrue(writer._readyPromise);
        writer._readyPromise_reject(reason);
        writer._readyPromise_resolve = undefined;
        writer._readyPromise_reject = undefined;
        writer._readyPromiseState = "rejected";
    }
    function defaultWriterReadyPromiseReset(writer) {
        defaultWriterReadyPromiseInitialize(writer);
    }
    function defaultWriterReadyPromiseResetToRejected(writer, reason) {
        defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterReadyPromiseResolve(writer) {
        if (writer._readyPromise_resolve === undefined) return;
        writer._readyPromise_resolve(undefined);
        writer._readyPromise_resolve = undefined;
        writer._readyPromise_reject = undefined;
        writer._readyPromiseState = "fulfilled";
    }
    /// <reference lib="dom" />
    const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : undefined;
    /// <reference types="node" />
    function isDOMExceptionConstructor(ctor) {
        if (!(typeof ctor === "function" || typeof ctor === "object")) return false;
        try {
            new ctor();
            return true;
        } catch (_a) {
            return false;
        }
    }
    function createDOMExceptionPolyfill() {
        // eslint-disable-next-line no-shadow
        const ctor = function DOMException1(message, name) {
            this.message = message || "";
            this.name = name || "Error";
            if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
        };
        ctor.prototype = Object.create(Error.prototype);
        Object.defineProperty(ctor.prototype, "constructor", {
            value: ctor,
            writable: true,
            configurable: true
        });
        return ctor;
    }
    // eslint-disable-next-line no-redeclare
    const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
    function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
        const reader = AcquireReadableStreamDefaultReader(source);
        const writer = AcquireWritableStreamDefaultWriter(dest);
        source._disturbed = true;
        let shuttingDown = false;
        // This is used to keep track of the spec's requirement that we wait for ongoing writes during shutdown.
        let currentWrite = promiseResolvedWith(undefined);
        return newPromise((resolve, reject)=>{
            let abortAlgorithm;
            if (signal !== undefined) {
                abortAlgorithm = ()=>{
                    const error = new DOMException$1("Aborted", "AbortError");
                    const actions = [];
                    if (!preventAbort) actions.push(()=>{
                        if (dest._state === "writable") return WritableStreamAbort(dest, error);
                        return promiseResolvedWith(undefined);
                    });
                    if (!preventCancel) actions.push(()=>{
                        if (source._state === "readable") return ReadableStreamCancel(source, error);
                        return promiseResolvedWith(undefined);
                    });
                    shutdownWithAction(()=>Promise.all(actions.map((action)=>action())), true, error);
                };
                if (signal.aborted) {
                    abortAlgorithm();
                    return;
                }
                signal.addEventListener("abort", abortAlgorithm);
            }
            // Using reader and writer, read all chunks from this and write them to dest
            // - Backpressure must be enforced
            // - Shutdown must stop all activity
            function pipeLoop() {
                return newPromise((resolveLoop, rejectLoop)=>{
                    function next(done) {
                        if (done) resolveLoop();
                        else // Use `PerformPromiseThen` instead of `uponPromise` to avoid
                        // adding unnecessary `.catch(rethrowAssertionErrorRejection)` handlers
                        PerformPromiseThen(pipeStep(), next, rejectLoop);
                    }
                    next(false);
                });
            }
            function pipeStep() {
                if (shuttingDown) return promiseResolvedWith(true);
                return PerformPromiseThen(writer._readyPromise, ()=>{
                    return newPromise((resolveRead, rejectRead)=>{
                        ReadableStreamDefaultReaderRead(reader, {
                            _chunkSteps: (chunk)=>{
                                currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), undefined, noop);
                                resolveRead(false);
                            },
                            _closeSteps: ()=>resolveRead(true),
                            _errorSteps: rejectRead
                        });
                    });
                });
            }
            // Errors must be propagated forward
            isOrBecomesErrored(source, reader._closedPromise, (storedError)=>{
                if (!preventAbort) shutdownWithAction(()=>WritableStreamAbort(dest, storedError), true, storedError);
                else shutdown(true, storedError);
            });
            // Errors must be propagated backward
            isOrBecomesErrored(dest, writer._closedPromise, (storedError)=>{
                if (!preventCancel) shutdownWithAction(()=>ReadableStreamCancel(source, storedError), true, storedError);
                else shutdown(true, storedError);
            });
            // Closing must be propagated forward
            isOrBecomesClosed(source, reader._closedPromise, ()=>{
                if (!preventClose) shutdownWithAction(()=>WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
                else shutdown();
            });
            // Closing must be propagated backward
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
                const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
                if (!preventCancel) shutdownWithAction(()=>ReadableStreamCancel(source, destClosed), true, destClosed);
                else shutdown(true, destClosed);
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
                // Another write may have started while we were waiting on this currentWrite, so we have to be sure to wait
                // for that too.
                const oldCurrentWrite = currentWrite;
                return PerformPromiseThen(currentWrite, ()=>oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : undefined);
            }
            function isOrBecomesErrored(stream, promise, action) {
                if (stream._state === "errored") action(stream._storedError);
                else uponRejection(promise, action);
            }
            function isOrBecomesClosed(stream, promise, action) {
                if (stream._state === "closed") action();
                else uponFulfillment(promise, action);
            }
            function shutdownWithAction(action, originalIsError, originalError) {
                if (shuttingDown) return;
                shuttingDown = true;
                if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) uponFulfillment(waitForWritesToFinish(), doTheRest);
                else doTheRest();
                function doTheRest() {
                    uponPromise(action(), ()=>finalize(originalIsError, originalError), (newError)=>finalize(true, newError));
                }
            }
            function shutdown(isError, error) {
                if (shuttingDown) return;
                shuttingDown = true;
                if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) uponFulfillment(waitForWritesToFinish(), ()=>finalize(isError, error));
                else finalize(isError, error);
            }
            function finalize(isError, error) {
                WritableStreamDefaultWriterRelease(writer);
                ReadableStreamReaderGenericRelease(reader);
                if (signal !== undefined) signal.removeEventListener("abort", abortAlgorithm);
                if (isError) reject(error);
                else resolve(undefined);
            }
        });
    }
    /**
     * Allows control of a {@link ReadableStream | readable stream}'s state and internal queue.
     *
     * @public
     */ class ReadableStreamDefaultController {
        constructor(){
            throw new TypeError("Illegal constructor");
        }
        /**
         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
         * over-full. An underlying source ought to use this information to determine when and how to apply backpressure.
         */ get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) throw defaultControllerBrandCheckException$1("desiredSize");
            return ReadableStreamDefaultControllerGetDesiredSize(this);
        }
        /**
         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
         * the stream, but once those are read, the stream will become closed.
         */ close() {
            if (!IsReadableStreamDefaultController(this)) throw defaultControllerBrandCheckException$1("close");
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) throw new TypeError("The stream is not in a state that permits close");
            ReadableStreamDefaultControllerClose(this);
        }
        enqueue(chunk) {
            if (!IsReadableStreamDefaultController(this)) throw defaultControllerBrandCheckException$1("enqueue");
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) throw new TypeError("The stream is not in a state that permits enqueue");
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
        }
        /**
         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
         */ error(e) {
            if (!IsReadableStreamDefaultController(this)) throw defaultControllerBrandCheckException$1("error");
            ReadableStreamDefaultControllerError(this, e);
        }
        /** @internal */ [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
        }
        /** @internal */ [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
                const chunk = DequeueValue(this);
                if (this._closeRequested && this._queue.length === 0) {
                    ReadableStreamDefaultControllerClearAlgorithms(this);
                    ReadableStreamClose(stream);
                } else ReadableStreamDefaultControllerCallPullIfNeeded(this);
                readRequest._chunkSteps(chunk);
            } else {
                ReadableStreamAddReadRequest(stream, readRequest);
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
        }
    }
    Object.defineProperties(ReadableStreamDefaultController.prototype, {
        close: {
            enumerable: true
        },
        enqueue: {
            enumerable: true
        },
        error: {
            enumerable: true
        },
        desiredSize: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultController",
        configurable: true
    });
    // Abstract operations for the ReadableStreamDefaultController.
    function IsReadableStreamDefaultController(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) return false;
        return x instanceof ReadableStreamDefaultController;
    }
    function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
        const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
        if (!shouldPull) return;
        if (controller._pulling) {
            controller._pullAgain = true;
            return;
        }
        controller._pulling = true;
        const pullPromise = controller._pullAlgorithm();
        uponPromise(pullPromise, ()=>{
            controller._pulling = false;
            if (controller._pullAgain) {
                controller._pullAgain = false;
                ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
        }, (e)=>{
            ReadableStreamDefaultControllerError(controller, e);
        });
    }
    function ReadableStreamDefaultControllerShouldCallPull(controller) {
        const stream = controller._controlledReadableStream;
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) return false;
        if (!controller._started) return false;
        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) return true;
        const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
        if (desiredSize > 0) return true;
        return false;
    }
    function ReadableStreamDefaultControllerClearAlgorithms(controller) {
        controller._pullAlgorithm = undefined;
        controller._cancelAlgorithm = undefined;
        controller._strategySizeAlgorithm = undefined;
    }
    // A client of ReadableStreamDefaultController may use these functions directly to bypass state check.
    function ReadableStreamDefaultControllerClose(controller) {
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) return;
        const stream = controller._controlledReadableStream;
        controller._closeRequested = true;
        if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
        }
    }
    function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) return;
        const stream = controller._controlledReadableStream;
        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) ReadableStreamFulfillReadRequest(stream, chunk, false);
        else {
            let chunkSize;
            try {
                chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
                ReadableStreamDefaultControllerError(controller, chunkSizeE);
                throw chunkSizeE;
            }
            try {
                EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
                ReadableStreamDefaultControllerError(controller, enqueueE);
                throw enqueueE;
            }
        }
        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    }
    function ReadableStreamDefaultControllerError(controller, e) {
        const stream = controller._controlledReadableStream;
        if (stream._state !== "readable") return;
        ResetQueue(controller);
        ReadableStreamDefaultControllerClearAlgorithms(controller);
        ReadableStreamError(stream, e);
    }
    function ReadableStreamDefaultControllerGetDesiredSize(controller) {
        const state = controller._controlledReadableStream._state;
        if (state === "errored") return null;
        if (state === "closed") return 0;
        return controller._strategyHWM - controller._queueTotalSize;
    }
    // This is used in the implementation of TransformStream.
    function ReadableStreamDefaultControllerHasBackpressure(controller) {
        if (ReadableStreamDefaultControllerShouldCallPull(controller)) return false;
        return true;
    }
    function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
        const state = controller._controlledReadableStream._state;
        if (!controller._closeRequested && state === "readable") return true;
        return false;
    }
    function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
        controller._controlledReadableStream = stream;
        controller._queue = undefined;
        controller._queueTotalSize = undefined;
        ResetQueue(controller);
        controller._started = false;
        controller._closeRequested = false;
        controller._pullAgain = false;
        controller._pulling = false;
        controller._strategySizeAlgorithm = sizeAlgorithm;
        controller._strategyHWM = highWaterMark;
        controller._pullAlgorithm = pullAlgorithm;
        controller._cancelAlgorithm = cancelAlgorithm;
        stream._readableStreamController = controller;
        const startResult = startAlgorithm();
        uponPromise(promiseResolvedWith(startResult), ()=>{
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }, (r)=>{
            ReadableStreamDefaultControllerError(controller, r);
        });
    }
    function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
        const controller = Object.create(ReadableStreamDefaultController.prototype);
        let startAlgorithm = ()=>undefined;
        let pullAlgorithm = ()=>promiseResolvedWith(undefined);
        let cancelAlgorithm = ()=>promiseResolvedWith(undefined);
        if (underlyingSource.start !== undefined) startAlgorithm = ()=>underlyingSource.start(controller);
        if (underlyingSource.pull !== undefined) pullAlgorithm = ()=>underlyingSource.pull(controller);
        if (underlyingSource.cancel !== undefined) cancelAlgorithm = (reason)=>underlyingSource.cancel(reason);
        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
    }
    // Helper functions for the ReadableStreamDefaultController.
    function defaultControllerBrandCheckException$1(name) {
        return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
    }
    function ReadableStreamTee(stream, cloneForBranch2) {
        if (IsReadableByteStreamController(stream._readableStreamController)) return ReadableByteStreamTee(stream);
        return ReadableStreamDefaultTee(stream);
    }
    function ReadableStreamDefaultTee(stream, cloneForBranch2) {
        const reader = AcquireReadableStreamDefaultReader(stream);
        let reading = false;
        let readAgain = false;
        let canceled1 = false;
        let canceled2 = false;
        let reason1;
        let reason2;
        let branch1;
        let branch2;
        let resolveCancelPromise;
        const cancelPromise = newPromise((resolve)=>{
            resolveCancelPromise = resolve;
        });
        function pullAlgorithm() {
            if (reading) {
                readAgain = true;
                return promiseResolvedWith(undefined);
            }
            reading = true;
            const readRequest = {
                _chunkSteps: (chunk)=>{
                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                    queueMicrotask(()=>{
                        readAgain = false;
                        const chunk1 = chunk;
                        const chunk2 = chunk;
                        // There is no way to access the cloning code right now in the reference implementation.
                        // If we add one then we'll need an implementation for serializable objects.
                        // if (!canceled2 && cloneForBranch2) {
                        //   chunk2 = StructuredDeserialize(StructuredSerialize(chunk2));
                        // }
                        if (!canceled1) ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                        if (!canceled2) ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                        reading = false;
                        if (readAgain) pullAlgorithm();
                    });
                },
                _closeSteps: ()=>{
                    reading = false;
                    if (!canceled1) ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                    if (!canceled2) ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                    if (!canceled1 || !canceled2) resolveCancelPromise(undefined);
                },
                _errorSteps: ()=>{
                    reading = false;
                }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(undefined);
        }
        function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
                const compositeReason = CreateArrayFromList([
                    reason1,
                    reason2
                ]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
                const compositeReason = CreateArrayFromList([
                    reason1,
                    reason2
                ]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function startAlgorithm() {
        // do nothing
        }
        branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
        branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
        uponRejection(reader._closedPromise, (r)=>{
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) resolveCancelPromise(undefined);
        });
        return [
            branch1,
            branch2
        ];
    }
    function ReadableByteStreamTee(stream) {
        let reader = AcquireReadableStreamDefaultReader(stream);
        let reading = false;
        let readAgainForBranch1 = false;
        let readAgainForBranch2 = false;
        let canceled1 = false;
        let canceled2 = false;
        let reason1;
        let reason2;
        let branch1;
        let branch2;
        let resolveCancelPromise;
        const cancelPromise = newPromise((resolve)=>{
            resolveCancelPromise = resolve;
        });
        function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r)=>{
                if (thisReader !== reader) return;
                ReadableByteStreamControllerError(branch1._readableStreamController, r);
                ReadableByteStreamControllerError(branch2._readableStreamController, r);
                if (!canceled1 || !canceled2) resolveCancelPromise(undefined);
            });
        }
        function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
                ReadableStreamReaderGenericRelease(reader);
                reader = AcquireReadableStreamDefaultReader(stream);
                forwardReaderError(reader);
            }
            const readRequest = {
                _chunkSteps: (chunk)=>{
                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                    queueMicrotask(()=>{
                        readAgainForBranch1 = false;
                        readAgainForBranch2 = false;
                        const chunk1 = chunk;
                        let chunk2 = chunk;
                        if (!canceled1 && !canceled2) try {
                            chunk2 = CloneAsUint8Array(chunk);
                        } catch (cloneE) {
                            ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                            ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                            resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                            return;
                        }
                        if (!canceled1) ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                        if (!canceled2) ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                        reading = false;
                        if (readAgainForBranch1) pull1Algorithm();
                        else if (readAgainForBranch2) pull2Algorithm();
                    });
                },
                _closeSteps: ()=>{
                    reading = false;
                    if (!canceled1) ReadableByteStreamControllerClose(branch1._readableStreamController);
                    if (!canceled2) ReadableByteStreamControllerClose(branch2._readableStreamController);
                    if (branch1._readableStreamController._pendingPullIntos.length > 0) ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                    if (branch2._readableStreamController._pendingPullIntos.length > 0) ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                    if (!canceled1 || !canceled2) resolveCancelPromise(undefined);
                },
                _errorSteps: ()=>{
                    reading = false;
                }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
        }
        function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
                ReadableStreamReaderGenericRelease(reader);
                reader = AcquireReadableStreamBYOBReader(stream);
                forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
                _chunkSteps: (chunk)=>{
                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                    queueMicrotask(()=>{
                        readAgainForBranch1 = false;
                        readAgainForBranch2 = false;
                        const byobCanceled = forBranch2 ? canceled2 : canceled1;
                        const otherCanceled = forBranch2 ? canceled1 : canceled2;
                        if (!otherCanceled) {
                            let clonedChunk;
                            try {
                                clonedChunk = CloneAsUint8Array(chunk);
                            } catch (cloneE) {
                                ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                                ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                                resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                                return;
                            }
                            if (!byobCanceled) ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                            ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                        } else if (!byobCanceled) ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                        reading = false;
                        if (readAgainForBranch1) pull1Algorithm();
                        else if (readAgainForBranch2) pull2Algorithm();
                    });
                },
                _closeSteps: (chunk)=>{
                    reading = false;
                    const byobCanceled = forBranch2 ? canceled2 : canceled1;
                    const otherCanceled = forBranch2 ? canceled1 : canceled2;
                    if (!byobCanceled) ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                    if (!otherCanceled) ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                    if (chunk !== undefined) {
                        if (!byobCanceled) ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                        if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                    }
                    if (!byobCanceled || !otherCanceled) resolveCancelPromise(undefined);
                },
                _errorSteps: ()=>{
                    reading = false;
                }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
        }
        function pull1Algorithm() {
            if (reading) {
                readAgainForBranch1 = true;
                return promiseResolvedWith(undefined);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) pullWithDefaultReader();
            else pullWithBYOBReader(byobRequest._view, false);
            return promiseResolvedWith(undefined);
        }
        function pull2Algorithm() {
            if (reading) {
                readAgainForBranch2 = true;
                return promiseResolvedWith(undefined);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) pullWithDefaultReader();
            else pullWithBYOBReader(byobRequest._view, true);
            return promiseResolvedWith(undefined);
        }
        function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
                const compositeReason = CreateArrayFromList([
                    reason1,
                    reason2
                ]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
                const compositeReason = CreateArrayFromList([
                    reason1,
                    reason2
                ]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function startAlgorithm() {
            return;
        }
        branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
        branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
        forwardReaderError(reader);
        return [
            branch1,
            branch2
        ];
    }
    function convertUnderlyingDefaultOrByteSource(source, context) {
        assertDictionary(source, context);
        const original = source;
        const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
        const cancel = original === null || original === void 0 ? void 0 : original.cancel;
        const pull = original === null || original === void 0 ? void 0 : original.pull;
        const start = original === null || original === void 0 ? void 0 : original.start;
        const type = original === null || original === void 0 ? void 0 : original.type;
        return {
            autoAllocateChunkSize: autoAllocateChunkSize === undefined ? undefined : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === undefined ? undefined : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === undefined ? undefined : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === undefined ? undefined : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === undefined ? undefined : convertReadableStreamType(type, `${context} has member 'type' that`)
        };
    }
    function convertUnderlyingSourceCancelCallback(fn, original, context) {
        assertFunction(fn, context);
        return (reason)=>promiseCall(fn, original, [
                reason
            ]);
    }
    function convertUnderlyingSourcePullCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller)=>promiseCall(fn, original, [
                controller
            ]);
    }
    function convertUnderlyingSourceStartCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller)=>reflectCall(fn, original, [
                controller
            ]);
    }
    function convertReadableStreamType(type, context) {
        type = `${type}`;
        if (type !== "bytes") throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
        return type;
    }
    function convertReaderOptions(options, context) {
        assertDictionary(options, context);
        const mode = options === null || options === void 0 ? void 0 : options.mode;
        return {
            mode: mode === undefined ? undefined : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
        };
    }
    function convertReadableStreamReaderMode(mode, context) {
        mode = `${mode}`;
        if (mode !== "byob") throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
        return mode;
    }
    function convertIteratorOptions(options, context) {
        assertDictionary(options, context);
        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
        return {
            preventCancel: Boolean(preventCancel)
        };
    }
    function convertPipeOptions(options, context) {
        assertDictionary(options, context);
        const preventAbort = options === null || options === void 0 ? void 0 : options.preventAbort;
        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
        const preventClose = options === null || options === void 0 ? void 0 : options.preventClose;
        const signal = options === null || options === void 0 ? void 0 : options.signal;
        if (signal !== undefined) assertAbortSignal(signal, `${context} has member 'signal' that`);
        return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal: signal
        };
    }
    function assertAbortSignal(signal, context) {
        if (!isAbortSignal(signal)) throw new TypeError(`${context} is not an AbortSignal.`);
    }
    function convertReadableWritablePair(pair, context) {
        assertDictionary(pair, context);
        const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
        assertRequiredField(readable, "readable", "ReadableWritablePair");
        assertReadableStream(readable, `${context} has member 'readable' that`);
        const writable = pair === null || pair === void 0 ? void 0 : pair.writable;
        assertRequiredField(writable, "writable", "ReadableWritablePair");
        assertWritableStream(writable, `${context} has member 'writable' that`);
        return {
            readable: readable,
            writable: writable
        };
    }
    /**
     * A readable stream represents a source of data, from which you can read.
     *
     * @public
     */ class ReadableStream {
        constructor(rawUnderlyingSource = {}, rawStrategy = {}){
            if (rawUnderlyingSource === undefined) rawUnderlyingSource = null;
            else assertObject(rawUnderlyingSource, "First parameter");
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
                if (strategy.size !== undefined) throw new RangeError("The strategy for a byte stream cannot have a size function");
                const highWaterMark = ExtractHighWaterMark(strategy, 0);
                SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
                const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
                const highWaterMark = ExtractHighWaterMark(strategy, 1);
                SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
        }
        /**
         * Whether or not the readable stream is locked to a {@link ReadableStreamDefaultReader | reader}.
         */ get locked() {
            if (!IsReadableStream(this)) throw streamBrandCheckException$1("locked");
            return IsReadableStreamLocked(this);
        }
        /**
         * Cancels the stream, signaling a loss of interest in the stream by a consumer.
         *
         * The supplied `reason` argument will be given to the underlying source's {@link UnderlyingSource.cancel | cancel()}
         * method, which might or might not use it.
         */ cancel(reason) {
            if (!IsReadableStream(this)) return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            if (IsReadableStreamLocked(this)) return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            return ReadableStreamCancel(this, reason);
        }
        getReader(rawOptions) {
            if (!IsReadableStream(this)) throw streamBrandCheckException$1("getReader");
            const options = convertReaderOptions(rawOptions, "First parameter");
            if (options.mode === undefined) return AcquireReadableStreamDefaultReader(this);
            return AcquireReadableStreamBYOBReader(this);
        }
        pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) throw streamBrandCheckException$1("pipeThrough");
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            if (IsWritableStreamLocked(transform.writable)) throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            const promise = ReadableStreamPipeTo(this, transform.writable, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
        }
        pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            if (destination === undefined) return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            if (!IsWritableStream(destination)) return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            let options;
            try {
                options = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
                return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            if (IsWritableStreamLocked(destination)) return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            return ReadableStreamPipeTo(this, destination, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
        }
        /**
         * Tees this readable stream, returning a two-element array containing the two resulting branches as
         * new {@link ReadableStream} instances.
         *
         * Teeing a stream will lock it, preventing any other consumer from acquiring a reader.
         * To cancel the stream, cancel both of the resulting branches; a composite cancellation reason will then be
         * propagated to the stream's underlying source.
         *
         * Note that the chunks seen in each branch will be the same object. If the chunks are not immutable,
         * this could allow interference between the two branches.
         */ tee() {
            if (!IsReadableStream(this)) throw streamBrandCheckException$1("tee");
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
        }
        values(rawOptions) {
            if (!IsReadableStream(this)) throw streamBrandCheckException$1("values");
            const options = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options.preventCancel);
        }
    }
    Object.defineProperties(ReadableStream.prototype, {
        cancel: {
            enumerable: true
        },
        getReader: {
            enumerable: true
        },
        pipeThrough: {
            enumerable: true
        },
        pipeTo: {
            enumerable: true
        },
        tee: {
            enumerable: true
        },
        values: {
            enumerable: true
        },
        locked: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStream",
        configurable: true
    });
    if (typeof SymbolPolyfill.asyncIterator === "symbol") Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.asyncIterator, {
        value: ReadableStream.prototype.values,
        writable: true,
        configurable: true
    });
    // Abstract operations for the ReadableStream.
    // Throws if and only if startAlgorithm throws.
    function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = ()=>1) {
        const stream = Object.create(ReadableStream.prototype);
        InitializeReadableStream(stream);
        const controller = Object.create(ReadableStreamDefaultController.prototype);
        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        return stream;
    }
    // Throws if and only if startAlgorithm throws.
    function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
        const stream = Object.create(ReadableStream.prototype);
        InitializeReadableStream(stream);
        const controller = Object.create(ReadableByteStreamController.prototype);
        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, undefined);
        return stream;
    }
    function InitializeReadableStream(stream) {
        stream._state = "readable";
        stream._reader = undefined;
        stream._storedError = undefined;
        stream._disturbed = false;
    }
    function IsReadableStream(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) return false;
        return x instanceof ReadableStream;
    }
    function IsReadableStreamLocked(stream) {
        if (stream._reader === undefined) return false;
        return true;
    }
    // ReadableStream API exposed for controllers.
    function ReadableStreamCancel(stream, reason) {
        stream._disturbed = true;
        if (stream._state === "closed") return promiseResolvedWith(undefined);
        if (stream._state === "errored") return promiseRejectedWith(stream._storedError);
        ReadableStreamClose(stream);
        const reader = stream._reader;
        if (reader !== undefined && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest)=>{
                readIntoRequest._closeSteps(undefined);
            });
            reader._readIntoRequests = new SimpleQueue();
        }
        const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
        return transformPromiseWith(sourceCancelPromise, noop);
    }
    function ReadableStreamClose(stream) {
        stream._state = "closed";
        const reader = stream._reader;
        if (reader === undefined) return;
        defaultReaderClosedPromiseResolve(reader);
        if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest)=>{
                readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
        }
    }
    function ReadableStreamError(stream, e) {
        stream._state = "errored";
        stream._storedError = e;
        const reader = stream._reader;
        if (reader === undefined) return;
        defaultReaderClosedPromiseReject(reader, e);
        if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest)=>{
                readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
        } else {
            reader._readIntoRequests.forEach((readIntoRequest)=>{
                readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
        }
    }
    // Helper functions for the ReadableStream.
    function streamBrandCheckException$1(name) {
        return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
    }
    function convertQueuingStrategyInit(init, context) {
        assertDictionary(init, context);
        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
        assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
        return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
        };
    }
    // The size function must not have a prototype property nor be a constructor
    const byteLengthSizeFunction = (chunk)=>{
        return chunk.byteLength;
    };
    try {
        Object.defineProperty(byteLengthSizeFunction, "name", {
            value: "size",
            configurable: true
        });
    } catch (_a) {
    // This property is non-configurable in older browsers, so ignore if this throws.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
    }
    /**
     * A queuing strategy that counts the number of bytes in each chunk.
     *
     * @public
     */ class ByteLengthQueuingStrategy {
        constructor(options){
            assertRequiredArgument(options, 1, "ByteLengthQueuingStrategy");
            options = convertQueuingStrategyInit(options, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options.highWaterMark;
        }
        /**
         * Returns the high water mark provided to the constructor.
         */ get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) throw byteLengthBrandCheckException("highWaterMark");
            return this._byteLengthQueuingStrategyHighWaterMark;
        }
        /**
         * Measures the size of `chunk` by returning the value of its `byteLength` property.
         */ get size() {
            if (!IsByteLengthQueuingStrategy(this)) throw byteLengthBrandCheckException("size");
            return byteLengthSizeFunction;
        }
    }
    Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
        highWaterMark: {
            enumerable: true
        },
        size: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "ByteLengthQueuingStrategy",
        configurable: true
    });
    // Helper functions for the ByteLengthQueuingStrategy.
    function byteLengthBrandCheckException(name) {
        return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
    }
    function IsByteLengthQueuingStrategy(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) return false;
        return x instanceof ByteLengthQueuingStrategy;
    }
    // The size function must not have a prototype property nor be a constructor
    const countSizeFunction = ()=>{
        return 1;
    };
    try {
        Object.defineProperty(countSizeFunction, "name", {
            value: "size",
            configurable: true
        });
    } catch (_a) {
    // This property is non-configurable in older browsers, so ignore if this throws.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
    }
    /**
     * A queuing strategy that counts the number of chunks.
     *
     * @public
     */ class CountQueuingStrategy {
        constructor(options){
            assertRequiredArgument(options, 1, "CountQueuingStrategy");
            options = convertQueuingStrategyInit(options, "First parameter");
            this._countQueuingStrategyHighWaterMark = options.highWaterMark;
        }
        /**
         * Returns the high water mark provided to the constructor.
         */ get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) throw countBrandCheckException("highWaterMark");
            return this._countQueuingStrategyHighWaterMark;
        }
        /**
         * Measures the size of `chunk` by always returning 1.
         * This ensures that the total queue size is a count of the number of chunks in the queue.
         */ get size() {
            if (!IsCountQueuingStrategy(this)) throw countBrandCheckException("size");
            return countSizeFunction;
        }
    }
    Object.defineProperties(CountQueuingStrategy.prototype, {
        highWaterMark: {
            enumerable: true
        },
        size: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "CountQueuingStrategy",
        configurable: true
    });
    // Helper functions for the CountQueuingStrategy.
    function countBrandCheckException(name) {
        return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
    }
    function IsCountQueuingStrategy(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) return false;
        return x instanceof CountQueuingStrategy;
    }
    function convertTransformer(original, context) {
        assertDictionary(original, context);
        const flush = original === null || original === void 0 ? void 0 : original.flush;
        const readableType = original === null || original === void 0 ? void 0 : original.readableType;
        const start = original === null || original === void 0 ? void 0 : original.start;
        const transform = original === null || original === void 0 ? void 0 : original.transform;
        const writableType = original === null || original === void 0 ? void 0 : original.writableType;
        return {
            flush: flush === undefined ? undefined : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType: readableType,
            start: start === undefined ? undefined : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === undefined ? undefined : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType: writableType
        };
    }
    function convertTransformerFlushCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller)=>promiseCall(fn, original, [
                controller
            ]);
    }
    function convertTransformerStartCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller)=>reflectCall(fn, original, [
                controller
            ]);
    }
    function convertTransformerTransformCallback(fn, original, context) {
        assertFunction(fn, context);
        return (chunk, controller)=>promiseCall(fn, original, [
                chunk,
                controller
            ]);
    }
    // Class TransformStream
    /**
     * A transform stream consists of a pair of streams: a {@link WritableStream | writable stream},
     * known as its writable side, and a {@link ReadableStream | readable stream}, known as its readable side.
     * In a manner specific to the transform stream in question, writes to the writable side result in new data being
     * made available for reading from the readable side.
     *
     * @public
     */ class TransformStream {
        constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}){
            if (rawTransformer === undefined) rawTransformer = null;
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== undefined) throw new RangeError("Invalid readableType specified");
            if (transformer.writableType !== undefined) throw new RangeError("Invalid writableType specified");
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve)=>{
                startPromise_resolve = resolve;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== undefined) startPromise_resolve(transformer.start(this._transformStreamController));
            else startPromise_resolve(undefined);
        }
        /**
         * The readable side of the transform stream.
         */ get readable() {
            if (!IsTransformStream(this)) throw streamBrandCheckException("readable");
            return this._readable;
        }
        /**
         * The writable side of the transform stream.
         */ get writable() {
            if (!IsTransformStream(this)) throw streamBrandCheckException("writable");
            return this._writable;
        }
    }
    Object.defineProperties(TransformStream.prototype, {
        readable: {
            enumerable: true
        },
        writable: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStream",
        configurable: true
    });
    function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
        function startAlgorithm() {
            return startPromise;
        }
        function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
        }
        function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
        }
        function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
        }
        stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
        function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
        }
        function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(undefined);
        }
        stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
        // The [[backpressure]] slot is set to undefined so that it can be initialised by TransformStreamSetBackpressure.
        stream._backpressure = undefined;
        stream._backpressureChangePromise = undefined;
        stream._backpressureChangePromise_resolve = undefined;
        TransformStreamSetBackpressure(stream, true);
        stream._transformStreamController = undefined;
    }
    function IsTransformStream(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) return false;
        return x instanceof TransformStream;
    }
    // This is a no-op if both sides are already errored.
    function TransformStreamError(stream, e) {
        ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
        TransformStreamErrorWritableAndUnblockWrite(stream, e);
    }
    function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
        TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
        WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
        if (stream._backpressure) // Pretend that pull() was called to permit any pending write() calls to complete. TransformStreamSetBackpressure()
        // cannot be called from enqueue() or pull() once the ReadableStream is errored, so this will will be the final time
        // _backpressure is set.
        TransformStreamSetBackpressure(stream, false);
    }
    function TransformStreamSetBackpressure(stream, backpressure) {
        // Passes also when called during construction.
        if (stream._backpressureChangePromise !== undefined) stream._backpressureChangePromise_resolve();
        stream._backpressureChangePromise = newPromise((resolve)=>{
            stream._backpressureChangePromise_resolve = resolve;
        });
        stream._backpressure = backpressure;
    }
    // Class TransformStreamDefaultController
    /**
     * Allows control of the {@link ReadableStream} and {@link WritableStream} of the associated {@link TransformStream}.
     *
     * @public
     */ class TransformStreamDefaultController {
        constructor(){
            throw new TypeError("Illegal constructor");
        }
        /**
         * Returns the desired size to fill the readable side’s internal queue. It can be negative, if the queue is over-full.
         */ get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) throw defaultControllerBrandCheckException("desiredSize");
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
        }
        enqueue(chunk) {
            if (!IsTransformStreamDefaultController(this)) throw defaultControllerBrandCheckException("enqueue");
            TransformStreamDefaultControllerEnqueue(this, chunk);
        }
        /**
         * Errors both the readable side and the writable side of the controlled transform stream, making all future
         * interactions with it fail with the given error `e`. Any chunks queued for transformation will be discarded.
         */ error(reason) {
            if (!IsTransformStreamDefaultController(this)) throw defaultControllerBrandCheckException("error");
            TransformStreamDefaultControllerError(this, reason);
        }
        /**
         * Closes the readable side and errors the writable side of the controlled transform stream. This is useful when the
         * transformer only needs to consume a portion of the chunks written to the writable side.
         */ terminate() {
            if (!IsTransformStreamDefaultController(this)) throw defaultControllerBrandCheckException("terminate");
            TransformStreamDefaultControllerTerminate(this);
        }
    }
    Object.defineProperties(TransformStreamDefaultController.prototype, {
        enqueue: {
            enumerable: true
        },
        error: {
            enumerable: true
        },
        terminate: {
            enumerable: true
        },
        desiredSize: {
            enumerable: true
        }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStreamDefaultController",
        configurable: true
    });
    // Transform Stream Default Controller Abstract Operations
    function IsTransformStreamDefaultController(x) {
        if (!typeIsObject(x)) return false;
        if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) return false;
        return x instanceof TransformStreamDefaultController;
    }
    function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
        controller._controlledTransformStream = stream;
        stream._transformStreamController = controller;
        controller._transformAlgorithm = transformAlgorithm;
        controller._flushAlgorithm = flushAlgorithm;
    }
    function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
        const controller = Object.create(TransformStreamDefaultController.prototype);
        let transformAlgorithm = (chunk)=>{
            try {
                TransformStreamDefaultControllerEnqueue(controller, chunk);
                return promiseResolvedWith(undefined);
            } catch (transformResultE) {
                return promiseRejectedWith(transformResultE);
            }
        };
        let flushAlgorithm = ()=>promiseResolvedWith(undefined);
        if (transformer.transform !== undefined) transformAlgorithm = (chunk)=>transformer.transform(chunk, controller);
        if (transformer.flush !== undefined) flushAlgorithm = ()=>transformer.flush(controller);
        SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
    }
    function TransformStreamDefaultControllerClearAlgorithms(controller) {
        controller._transformAlgorithm = undefined;
        controller._flushAlgorithm = undefined;
    }
    function TransformStreamDefaultControllerEnqueue(controller, chunk) {
        const stream = controller._controlledTransformStream;
        const readableController = stream._readable._readableStreamController;
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) throw new TypeError("Readable side is not in a state that permits enqueue");
        // We throttle transform invocations based on the backpressure of the ReadableStream, but we still
        // accept TransformStreamDefaultControllerEnqueue() calls.
        try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
        } catch (e) {
            // This happens when readableStrategy.size() throws.
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
        }
        const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
        if (backpressure !== stream._backpressure) TransformStreamSetBackpressure(stream, true);
    }
    function TransformStreamDefaultControllerError(controller, e) {
        TransformStreamError(controller._controlledTransformStream, e);
    }
    function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
        const transformPromise = controller._transformAlgorithm(chunk);
        return transformPromiseWith(transformPromise, undefined, (r)=>{
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
        });
    }
    function TransformStreamDefaultControllerTerminate(controller) {
        const stream = controller._controlledTransformStream;
        const readableController = stream._readable._readableStreamController;
        ReadableStreamDefaultControllerClose(readableController);
        const error = new TypeError("TransformStream terminated");
        TransformStreamErrorWritableAndUnblockWrite(stream, error);
    }
    // TransformStreamDefaultSink Algorithms
    function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
        const controller = stream._transformStreamController;
        if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, ()=>{
                const writable = stream._writable;
                const state = writable._state;
                if (state === "erroring") throw writable._storedError;
                return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
        }
        return TransformStreamDefaultControllerPerformTransform(controller, chunk);
    }
    function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
        // abort() is not called synchronously, so it is possible for abort() to be called when the stream is already
        // errored.
        TransformStreamError(stream, reason);
        return promiseResolvedWith(undefined);
    }
    function TransformStreamDefaultSinkCloseAlgorithm(stream) {
        // stream._readable cannot change after construction, so caching it across a call to user code is safe.
        const readable = stream._readable;
        const controller = stream._transformStreamController;
        const flushPromise = controller._flushAlgorithm();
        TransformStreamDefaultControllerClearAlgorithms(controller);
        // Return a promise that is fulfilled with undefined on success.
        return transformPromiseWith(flushPromise, ()=>{
            if (readable._state === "errored") throw readable._storedError;
            ReadableStreamDefaultControllerClose(readable._readableStreamController);
        }, (r)=>{
            TransformStreamError(stream, r);
            throw readable._storedError;
        });
    }
    // TransformStreamDefaultSource Algorithms
    function TransformStreamDefaultSourcePullAlgorithm(stream) {
        // Invariant. Enforced by the promises returned by start() and pull().
        TransformStreamSetBackpressure(stream, false);
        // Prevent the next pull() call until there is backpressure.
        return stream._backpressureChangePromise;
    }
    // Helper functions for the TransformStreamDefaultController.
    function defaultControllerBrandCheckException(name) {
        return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
    }
    // Helper functions for the TransformStream.
    function streamBrandCheckException(name) {
        return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
    }
    exports1.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
    exports1.CountQueuingStrategy = CountQueuingStrategy;
    exports1.ReadableByteStreamController = ReadableByteStreamController;
    exports1.ReadableStream = ReadableStream;
    exports1.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
    exports1.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
    exports1.ReadableStreamDefaultController = ReadableStreamDefaultController;
    exports1.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
    exports1.TransformStream = TransformStream;
    exports1.TransformStreamDefaultController = TransformStreamDefaultController;
    exports1.WritableStream = WritableStream;
    exports1.WritableStreamDefaultController = WritableStreamDefaultController;
    exports1.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
    Object.defineProperty(exports1, "__esModule", {
        value: true
    });
});

});

parcelRequire.register("jw5hj", function(module, exports) {

$parcel$export(module.exports, "FormData", () => $e35519a434a186c8$export$3963aa24c930693c);
$parcel$export(module.exports, "formDataToBlob", () => $e35519a434a186c8$export$a38b1dc2b31ef62a);
/*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */ 
var $cIDq7 = parcelRequire("cIDq7");

var $d67T9 = parcelRequire("d67T9");
var { toStringTag: $e35519a434a186c8$var$t , iterator: $e35519a434a186c8$var$i , hasInstance: $e35519a434a186c8$var$h  } = Symbol, $e35519a434a186c8$var$r = Math.random, $e35519a434a186c8$var$m = "append,set,get,getAll,delete,keys,values,entries,forEach,constructor".split(","), $e35519a434a186c8$var$f = (a, b, c)=>(a += "", /^(Blob|File)$/.test(b && b[$e35519a434a186c8$var$t]) ? [
        (c = c !== void 0 ? c + "" : b[$e35519a434a186c8$var$t] == "File" ? b.name : "blob", a),
        b.name !== c || b[$e35519a434a186c8$var$t] == "blob" ? new (0, $d67T9.default)([
            b
        ], c, b) : b
    ] : [
        a,
        b + ""
    ]), $e35519a434a186c8$var$e = (c, f)=>(f ? c : c.replace(/\r?\n|\r/g, "\r\n")).replace(/\n/g, "%0A").replace(/\r/g, "%0D").replace(/"/g, "%22"), $e35519a434a186c8$var$x = (n, a, e)=>{
    if (a.length < e) throw new TypeError(`Failed to execute '${n}' on 'FormData': ${e} arguments required, but only ${a.length} present.`);
};
const $e35519a434a186c8$export$b6afa8811b7e644e = (0, $d67T9.default);
const $e35519a434a186c8$export$3963aa24c930693c = class FormData {
    #d = [];
    constructor(...a){
        if (a.length) throw new TypeError(`Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'.`);
    }
    get [$e35519a434a186c8$var$t]() {
        return "FormData";
    }
    [$e35519a434a186c8$var$i]() {
        return this.entries();
    }
    static [$e35519a434a186c8$var$h](o) {
        return o && typeof o === "object" && o[$e35519a434a186c8$var$t] === "FormData" && !$e35519a434a186c8$var$m.some((m)=>typeof o[m] != "function");
    }
    append(...a) {
        $e35519a434a186c8$var$x("append", arguments, 2);
        this.#d.push($e35519a434a186c8$var$f(...a));
    }
    delete(a) {
        $e35519a434a186c8$var$x("delete", arguments, 1);
        a += "";
        this.#d = this.#d.filter(([b])=>b !== a);
    }
    get(a) {
        $e35519a434a186c8$var$x("get", arguments, 1);
        a += "";
        for(var b = this.#d, l = b.length, c = 0; c < l; c++)if (b[c][0] === a) return b[c][1];
        return null;
    }
    getAll(a, b) {
        $e35519a434a186c8$var$x("getAll", arguments, 1);
        b = [];
        a += "";
        this.#d.forEach((c)=>c[0] === a && b.push(c[1]));
        return b;
    }
    has(a) {
        $e35519a434a186c8$var$x("has", arguments, 1);
        a += "";
        return this.#d.some((b)=>b[0] === a);
    }
    forEach(a, b) {
        $e35519a434a186c8$var$x("forEach", arguments, 1);
        for (var [c, d] of this)a.call(b, d, c, this);
    }
    set(...a) {
        $e35519a434a186c8$var$x("set", arguments, 2);
        var b = [], c = !0;
        a = $e35519a434a186c8$var$f(...a);
        this.#d.forEach((d)=>{
            d[0] === a[0] ? c && (c = !b.push(a)) : b.push(d);
        });
        c && b.push(a);
        this.#d = b;
    }
    *entries() {
        yield* this.#d;
    }
    *keys() {
        for (var [a] of this)yield a;
    }
    *values() {
        for (var [, a] of this)yield a;
    }
};
function $e35519a434a186c8$export$a38b1dc2b31ef62a(F, B = (0, $cIDq7.default)) {
    var b = `${$e35519a434a186c8$var$r()}${$e35519a434a186c8$var$r()}`.replace(/\./g, "").slice(-28).padStart(32, "-"), c = [], p = `--${b}\r\nContent-Disposition: form-data; name="`;
    F.forEach((v, n)=>typeof v == "string" ? c.push(p + $e35519a434a186c8$var$e(n) + `"\r\n\r\n${v.replace(/\r(?!\n)|(?<!\r)\n/g, "\r\n")}\r\n`) : c.push(p + $e35519a434a186c8$var$e(n) + `"; filename="${$e35519a434a186c8$var$e(v.name, 1)}"\r\nContent-Type: ${v.type || "application/octet-stream"}\r\n\r\n`, v, "\r\n"));
    c.push(`--${b}--`);
    return new B(c, {
        type: "multipart/form-data; boundary=" + b
    });
}

});
parcelRequire.register("cIDq7", function(module, exports) {

$parcel$export(module.exports, "default", () => $94282c1fd4a84ba7$export$2e2bcd8739ae039);
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */ // TODO (jimmywarting): in the feature use conditional loading with top level await (requires 14.x)
// Node has recently added whatwg stream into core
parcelRequire("79dgN");
// 64 KiB (same size chrome slice theirs blob into Uint8array's)
const $94282c1fd4a84ba7$var$POOL_SIZE = 65536;
/** @param {(Blob | Uint8Array)[]} parts */ async function* $94282c1fd4a84ba7$var$toIterator(parts, clone = true) {
    for (const part of parts){
        if ("stream" in part) yield* /** @type {AsyncIterableIterator<Uint8Array>} */ part.stream();
        else if (ArrayBuffer.isView(part)) {
            if (clone) {
                let position = part.byteOffset;
                const end = part.byteOffset + part.byteLength;
                while(position !== end){
                    const size = Math.min(end - position, $94282c1fd4a84ba7$var$POOL_SIZE);
                    const chunk = part.buffer.slice(position, position + size);
                    position += chunk.byteLength;
                    yield new Uint8Array(chunk);
                }
            } else yield part;
        } else {
            // For blobs that have arrayBuffer but no stream method (nodes buffer.Blob)
            let position = 0, b = /** @type {Blob} */ part;
            while(position !== b.size){
                const chunk = b.slice(position, Math.min(b.size, position + $94282c1fd4a84ba7$var$POOL_SIZE));
                const buffer = await chunk.arrayBuffer();
                position += buffer.byteLength;
                yield new Uint8Array(buffer);
            }
        }
    }
}
const $94282c1fd4a84ba7$var$_Blob = class Blob {
    /** @type {Array.<(Blob|Uint8Array)>} */ #parts = [];
    #type = "";
    #size = 0;
    #endings = "transparent";
    /**
   * The Blob() constructor returns a new Blob object. The content
   * of the blob consists of the concatenation of the values given
   * in the parameter array.
   *
   * @param {*} blobParts
   * @param {{ type?: string, endings?: string }} [options]
   */ constructor(blobParts = [], options = {}){
        if (typeof blobParts !== "object" || blobParts === null) throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
        if (typeof blobParts[Symbol.iterator] !== "function") throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
        if (typeof options !== "object" && typeof options !== "function") throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
        if (options === null) options = {};
        const encoder = new TextEncoder();
        for (const element of blobParts){
            let part;
            if (ArrayBuffer.isView(element)) part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
            else if (element instanceof ArrayBuffer) part = new Uint8Array(element.slice(0));
            else if (element instanceof Blob) part = element;
            else part = encoder.encode(`${element}`);
            this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
            this.#parts.push(part);
        }
        this.#endings = `${options.endings === undefined ? "transparent" : options.endings}`;
        const type = options.type === undefined ? "" : String(options.type);
        this.#type = /^[\x20-\x7E]*$/.test(type) ? type : "";
    }
    /**
   * The Blob interface's size property returns the
   * size of the Blob in bytes.
   */ get size() {
        return this.#size;
    }
    /**
   * The type property of a Blob object returns the MIME type of the file.
   */ get type() {
        return this.#type;
    }
    /**
   * The text() method in the Blob interface returns a Promise
   * that resolves with a string containing the contents of
   * the blob, interpreted as UTF-8.
   *
   * @return {Promise<string>}
   */ async text() {
        // More optimized than using this.arrayBuffer()
        // that requires twice as much ram
        const decoder = new TextDecoder();
        let str = "";
        for await (const part of $94282c1fd4a84ba7$var$toIterator(this.#parts, false))str += decoder.decode(part, {
            stream: true
        });
        // Remaining
        str += decoder.decode();
        return str;
    }
    /**
   * The arrayBuffer() method in the Blob interface returns a
   * Promise that resolves with the contents of the blob as
   * binary data contained in an ArrayBuffer.
   *
   * @return {Promise<ArrayBuffer>}
   */ async arrayBuffer() {
        // Easier way... Just a unnecessary overhead
        // const view = new Uint8Array(this.size);
        // await this.stream().getReader({mode: 'byob'}).read(view);
        // return view.buffer;
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of $94282c1fd4a84ba7$var$toIterator(this.#parts, false)){
            data.set(chunk, offset);
            offset += chunk.length;
        }
        return data.buffer;
    }
    stream() {
        const it = $94282c1fd4a84ba7$var$toIterator(this.#parts, true);
        return new globalThis.ReadableStream({
            // @ts-ignore
            type: "bytes",
            async pull (ctrl) {
                const chunk = await it.next();
                chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
            },
            async cancel () {
                await it.return();
            }
        });
    }
    /**
   * The Blob interface's slice() method creates and returns a
   * new Blob object which contains data from a subset of the
   * blob on which it's called.
   *
   * @param {number} [start]
   * @param {number} [end]
   * @param {string} [type]
   */ slice(start = 0, end = this.size, type = "") {
        const { size: size  } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = this.#parts;
        const blobParts = [];
        let added = 0;
        for (const part of parts){
            // don't add the overflow to new blobParts
            if (added >= span) break;
            const size = ArrayBuffer.isView(part) ? part.byteLength : part.size;
            if (relativeStart && size <= relativeStart) {
                // Skip the beginning and change the relative
                // start & end position as we skip the unwanted parts
                relativeStart -= size;
                relativeEnd -= size;
            } else {
                let chunk;
                if (ArrayBuffer.isView(part)) {
                    chunk = part.subarray(relativeStart, Math.min(size, relativeEnd));
                    added += chunk.byteLength;
                } else {
                    chunk = part.slice(relativeStart, Math.min(size, relativeEnd));
                    added += chunk.size;
                }
                relativeEnd -= size;
                blobParts.push(chunk);
                relativeStart = 0 // All next sequential parts should start at 0
                ;
            }
        }
        const blob = new Blob([], {
            type: String(type).toLowerCase()
        });
        blob.#size = span;
        blob.#parts = blobParts;
        return blob;
    }
    get [Symbol.toStringTag]() {
        return "Blob";
    }
    static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
    }
};
Object.defineProperties($94282c1fd4a84ba7$var$_Blob.prototype, {
    size: {
        enumerable: true
    },
    type: {
        enumerable: true
    },
    slice: {
        enumerable: true
    }
});
const $94282c1fd4a84ba7$export$3b660928c86ff55c = $94282c1fd4a84ba7$var$_Blob;
var $94282c1fd4a84ba7$export$2e2bcd8739ae039 = $94282c1fd4a84ba7$export$3b660928c86ff55c;

});
parcelRequire.register("79dgN", function(module, exports) {
/* c8 ignore start */ // 64 KiB (same size chrome slice theirs blob into Uint8array's)
const $99a88859d52a19e3$var$POOL_SIZE = 65536;



if (!globalThis.ReadableStream) // `node:stream/web` got introduced in v16.5.0 as experimental
// and it's preferred over the polyfilled version. So we also
// suppress the warning that gets emitted by NodeJS for using it.
try {
    const process = $99a88859d52a19e3$import$a0113067e94a2394;
    const { emitWarning: emitWarning  } = process;
    try {
        process.emitWarning = ()=>{};
        Object.assign(globalThis, $99a88859d52a19e3$import$69cf9fb4cb860a04);
        process.emitWarning = emitWarning;
    } catch (error) {
        process.emitWarning = emitWarning;
        throw error;
    }
} catch (error) {
    // fallback to polyfill implementation
    Object.assign(globalThis, (parcelRequire("47OzZ")));
}

try {
    // Don't use node: prefix for this, require+node: is not supported until node v14.14
    // Only `import()` can use prefix in 12.20 and later
    const { Blob: Blob  } = $99a88859d52a19e3$import$16b0c0ac8d6b8d92;
    if (Blob && !Blob.prototype.stream) Blob.prototype.stream = function name(params) {
        let position = 0;
        const blob = this;
        return new ReadableStream({
            type: "bytes",
            async pull (ctrl) {
                const chunk = blob.slice(position, Math.min(blob.size, position + $99a88859d52a19e3$var$POOL_SIZE));
                const buffer = await chunk.arrayBuffer();
                position += buffer.byteLength;
                ctrl.enqueue(new Uint8Array(buffer));
                if (position === blob.size) ctrl.close();
            }
        });
    };
} catch (error) {} /* c8 ignore end */ 

});


parcelRequire.register("d67T9", function(module, exports) {

$parcel$export(module.exports, "default", () => $9891f464f0e994ae$export$2e2bcd8739ae039);

var $cIDq7 = parcelRequire("cIDq7");
const $9891f464f0e994ae$var$_File = class File extends (0, $cIDq7.default) {
    #lastModified = 0;
    #name = "";
    /**
   * @param {*[]} fileBits
   * @param {string} fileName
   * @param {{lastModified?: number, type?: string}} options
   */ // @ts-ignore
    constructor(fileBits, fileName, options = {}){
        if (arguments.length < 2) throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`);
        super(fileBits, options);
        if (options === null) options = {};
        // Simulate WebIDL type casting for NaN value in lastModified option.
        const lastModified = options.lastModified === undefined ? Date.now() : Number(options.lastModified);
        if (!Number.isNaN(lastModified)) this.#lastModified = lastModified;
        this.#name = String(fileName);
    }
    get name() {
        return this.#name;
    }
    get lastModified() {
        return this.#lastModified;
    }
    get [Symbol.toStringTag]() {
        return "File";
    }
    static [Symbol.hasInstance](object) {
        return !!object && object instanceof (0, $cIDq7.default) && /^(File)$/.test(object[Symbol.toStringTag]);
    }
};
const $9891f464f0e994ae$export$b6afa8811b7e644e = $9891f464f0e994ae$var$_File;
var $9891f464f0e994ae$export$2e2bcd8739ae039 = $9891f464f0e994ae$export$b6afa8811b7e644e;

});


parcelRequire.register("g16Ft", function(module, exports) {
module.exports = import("./multipart-parser.4b8f8be7.js").then(()=>parcelRequire("9wyl8"));

});

parcelRequire.register("5L7Gm", function(module, exports) {

$parcel$export(module.exports, "File", () => (parcelRequire("d67T9")).default);



var $9IXgn = parcelRequire("9IXgn");

var $d67T9 = parcelRequire("d67T9");

var $cIDq7 = parcelRequire("cIDq7");
const { stat: $43174d0f349da0ca$var$stat  } = (0, $53f36$promises);
/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 */ const $43174d0f349da0ca$export$78b5aa82db01a2bc = (path, type)=>$43174d0f349da0ca$var$fromBlob((0, $53f36$statSync)(path), path, type);
/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 * @returns {Promise<Blob>}
 */ const $43174d0f349da0ca$export$504fbde693c1771c = (path, type)=>$43174d0f349da0ca$var$stat(path).then((stat)=>$43174d0f349da0ca$var$fromBlob(stat, path, type));
/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 * @returns {Promise<File>}
 */ const $43174d0f349da0ca$export$c608e926fc97109f = (path, type)=>$43174d0f349da0ca$var$stat(path).then((stat)=>$43174d0f349da0ca$var$fromFile(stat, path, type));
/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 */ const $43174d0f349da0ca$export$bfe7c9da1baa5f76 = (path, type)=>$43174d0f349da0ca$var$fromFile((0, $53f36$statSync)(path), path, type);
// @ts-ignore
const $43174d0f349da0ca$var$fromBlob = (stat, path, type = "")=>new (0, $cIDq7.default)([
        new $43174d0f349da0ca$var$BlobDataItem({
            path: path,
            size: stat.size,
            lastModified: stat.mtimeMs,
            start: 0
        })
    ], {
        type: type
    });
// @ts-ignore
const $43174d0f349da0ca$var$fromFile = (stat, path, type = "")=>new (0, $d67T9.default)([
        new $43174d0f349da0ca$var$BlobDataItem({
            path: path,
            size: stat.size,
            lastModified: stat.mtimeMs,
            start: 0
        })
    ], (0, $53f36$basename)(path), {
        type: type,
        lastModified: stat.mtimeMs
    });
/**
 * This is a blob backed up by a file on the disk
 * with minium requirement. Its wrapped around a Blob as a blobPart
 * so you have no direct access to this.
 *
 * @private
 */ class $43174d0f349da0ca$var$BlobDataItem {
    #path;
    #start;
    constructor(options){
        this.#path = options.path;
        this.#start = options.start;
        this.size = options.size;
        this.lastModified = options.lastModified;
    }
    /**
   * Slicing arguments is first validated and formatted
   * to not be out of range by Blob.prototype.slice
   */ slice(start, end) {
        return new $43174d0f349da0ca$var$BlobDataItem({
            path: this.#path,
            lastModified: this.lastModified,
            size: end - start,
            start: this.#start + start
        });
    }
    async *stream() {
        const { mtimeMs: mtimeMs  } = await $43174d0f349da0ca$var$stat(this.#path);
        if (mtimeMs > this.lastModified) throw new (0, (/*@__PURE__*/$parcel$interopDefault($9IXgn)))("The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.", "NotReadableError");
        yield* (0, $53f36$createReadStream)(this.#path, {
            start: this.#start,
            end: this.#start + this.size - 1
        });
    }
    get [Symbol.toStringTag]() {
        return "Blob";
    }
}
var $43174d0f349da0ca$export$2e2bcd8739ae039 = $43174d0f349da0ca$export$78b5aa82db01a2bc;

});
parcelRequire.register("9IXgn", function(module, exports) {
/*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */ 
if (!globalThis.DOMException) try {
    const { MessageChannel: MessageChannel  } = $714631898549a2de$import$b63f432bf838ee78, port = new MessageChannel().port1, ab = new ArrayBuffer();
    port.postMessage(ab, [
        ab,
        ab
    ]);
} catch (err) {
    err.constructor.name === "DOMException" && (globalThis.DOMException = err.constructor);
}
module.exports = globalThis.DOMException;

});


// import axios from "axios";
/**
 * Index.js
 *
 * a request API compatible with window.fetch
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */ 




/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 * @returns {Buffer} Buffer instance from Data URI
 * @api public
 */ 
var $3742280dd51c6952$require$Buffer = $53f36$Buffer1;
function $3742280dd51c6952$export$c16abeadb25f3229(uri) {
    if (!/^data:/i.test(uri)) throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    // strip newlines
    uri = uri.replace(/\r?\n/g, "");
    // split the URI up into the "metadata" and the "data" portions
    const firstComma = uri.indexOf(",");
    if (firstComma === -1 || firstComma <= 4) throw new TypeError("malformed data: URI");
    // remove the "data:" scheme and parse the metadata
    const meta = uri.substring(5, firstComma).split(";");
    let charset = "";
    let base64 = false;
    const type = meta[0] || "text/plain";
    let typeFull = type;
    for(let i = 1; i < meta.length; i++){
        if (meta[i] === "base64") base64 = true;
        else if (meta[i]) {
            typeFull += `;${meta[i]}`;
            if (meta[i].indexOf("charset=") === 0) charset = meta[i].substring(8);
        }
    }
    // defaults to US-ASCII only if type is not provided
    if (!meta[0] && !charset.length) {
        typeFull += ";charset=US-ASCII";
        charset = "US-ASCII";
    }
    // get the encoded data portion and decode URI-encoded chars
    const encoding = base64 ? "base64" : "ascii";
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = $3742280dd51c6952$require$Buffer.from(data, encoding);
    // set `.type` and `.typeFull` properties to MIME type
    buffer.type = type;
    buffer.typeFull = typeFull;
    // set the `.charset` property
    buffer.charset = charset;
    return buffer;
}
var $3742280dd51c6952$export$2e2bcd8739ae039 = $3742280dd51c6952$export$c16abeadb25f3229;


/**
 * Body.js
 *
 * Body interface provides common methods for Request and Response
 */ 



var $cIDq7 = parcelRequire("cIDq7");

var $jw5hj = parcelRequire("jw5hj");
class $1bad95c2743e9fdb$export$359423e5a663266f extends Error {
    constructor(message, type){
        super(message);
        // Hide custom error implementation details from end-users
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
    }
    get name() {
        return this.constructor.name;
    }
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}


class $e0e93397b613af1b$export$26e841bcf1aeb894 extends (0, $1bad95c2743e9fdb$export$359423e5a663266f) {
    /**
	 * @param  {string} message -      Error message for human
	 * @param  {string} [type] -        Error type for machine
	 * @param  {SystemError} [systemError] - For Node.js system error
	 */ constructor(message, type, systemError){
        super(message, type);
        // When err.type is `system`, err.erroredSysCall contains system error and err.code contains system error code
        if (systemError) {
            // eslint-disable-next-line no-multi-assign
            this.code = this.errno = systemError.code;
            this.erroredSysCall = systemError.syscall;
        }
    }
}



/**
 * Is.js
 *
 * Object type checks.
 */ const $7ab3eb0015307789$var$NAME = Symbol.toStringTag;
const $7ab3eb0015307789$export$403f486803bfc6ff = (object)=>{
    return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[$7ab3eb0015307789$var$NAME] === "URLSearchParams";
};
const $7ab3eb0015307789$export$5bcd6e94ed871c88 = (object)=>{
    return object && typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[$7ab3eb0015307789$var$NAME]);
};
const $7ab3eb0015307789$export$8fb8889db6ef9202 = (object)=>{
    return typeof object === "object" && (object[$7ab3eb0015307789$var$NAME] === "AbortSignal" || object[$7ab3eb0015307789$var$NAME] === "EventTarget");
};
const $7ab3eb0015307789$export$f0f20af6002339ab = (destination, original)=>{
    const orig = new URL(original).hostname;
    const dest = new URL(destination).hostname;
    return orig === dest || orig.endsWith(`.${dest}`);
};
const $7ab3eb0015307789$export$b756189618c5d1d5 = (destination, original)=>{
    const orig = new URL(original).protocol;
    const dest = new URL(destination).protocol;
    return orig === dest;
};


const $6fccded033b67de9$var$pipeline = (0, $53f36$promisify)((0, $53f36$nodestream).pipeline);
const $6fccded033b67de9$var$INTERNALS = Symbol("Body internals");

class $6fccded033b67de9$export$2e2bcd8739ae039 {
    constructor(body, { size: size = 0  } = {}){
        let boundary = null;
        if (body === null) // Body is undefined or null
        body = null;
        else if ((0, $7ab3eb0015307789$export$403f486803bfc6ff)(body)) // Body is a URLSearchParams
        body = (0, $53f36$Buffer).from(body.toString());
        else if ((0, $7ab3eb0015307789$export$5bcd6e94ed871c88)(body)) ;
        else if ((0, $53f36$Buffer).isBuffer(body)) ;
        else if ((0, $53f36$types).isAnyArrayBuffer(body)) // Body is ArrayBuffer
        body = (0, $53f36$Buffer).from(body);
        else if (ArrayBuffer.isView(body)) // Body is ArrayBufferView
        body = (0, $53f36$Buffer).from(body.buffer, body.byteOffset, body.byteLength);
        else if (body instanceof (0, $53f36$nodestream)) ;
        else if (body instanceof (0, $jw5hj.FormData)) {
            // Body is FormData
            body = (0, $jw5hj.formDataToBlob)(body);
            boundary = body.type.split("=")[1];
        } else // None of the above
        // coerce to string then buffer
        body = (0, $53f36$Buffer).from(String(body));
        let stream = body;
        if ((0, $53f36$Buffer).isBuffer(body)) stream = (0, $53f36$nodestream).Readable.from(body);
        else if ((0, $7ab3eb0015307789$export$5bcd6e94ed871c88)(body)) stream = (0, $53f36$nodestream).Readable.from(body.stream());
        this[$6fccded033b67de9$var$INTERNALS] = {
            body: body,
            stream: stream,
            boundary: boundary,
            disturbed: false,
            error: null
        };
        this.size = size;
        if (body instanceof (0, $53f36$nodestream)) body.on("error", (error_)=>{
            const error = error_ instanceof (0, $1bad95c2743e9fdb$export$359423e5a663266f) ? error_ : new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[$6fccded033b67de9$var$INTERNALS].error = error;
        });
    }
    get body() {
        return this[$6fccded033b67de9$var$INTERNALS].stream;
    }
    get bodyUsed() {
        return this[$6fccded033b67de9$var$INTERNALS].disturbed;
    }
    /**
	 * Decode response as ArrayBuffer
	 *
	 * @return  Promise
	 */ async arrayBuffer() {
        const { buffer: buffer , byteOffset: byteOffset , byteLength: byteLength  } = await $6fccded033b67de9$var$consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
    }
    async formData() {
        const ct = this.headers.get("content-type");
        if (ct.startsWith("application/x-www-form-urlencoded")) {
            const formData = new (0, $jw5hj.FormData)();
            const parameters = new URLSearchParams(await this.text());
            for (const [name, value] of parameters)formData.append(name, value);
            return formData;
        }
        const { toFormData: toFormData  } = await (parcelRequire("g16Ft"));
        return toFormData(this.body, ct);
    }
    /**
	 * Return raw response as Blob
	 *
	 * @return Promise
	 */ async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[$6fccded033b67de9$var$INTERNALS].body && this[$6fccded033b67de9$var$INTERNALS].body.type || "";
        const buf = await this.arrayBuffer();
        return new (0, $cIDq7.default)([
            buf
        ], {
            type: ct
        });
    }
    /**
	 * Decode response as json
	 *
	 * @return  Promise
	 */ async json() {
        const text = await this.text();
        return JSON.parse(text);
    }
    /**
	 * Decode response as text
	 *
	 * @return  Promise
	 */ async text() {
        const buffer = await $6fccded033b67de9$var$consumeBody(this);
        return new TextDecoder().decode(buffer);
    }
    /**
	 * Decode response as buffer (non-spec api)
	 *
	 * @return  Promise
	 */ buffer() {
        return $6fccded033b67de9$var$consumeBody(this);
    }
}
$6fccded033b67de9$export$2e2bcd8739ae039.prototype.buffer = (0, $53f36$deprecate)($6fccded033b67de9$export$2e2bcd8739ae039.prototype.buffer, "Please use 'response.arrayBuffer()' instead of 'response.buffer()'", "node-fetch#buffer");
// In browsers, all properties are enumerable.
Object.defineProperties($6fccded033b67de9$export$2e2bcd8739ae039.prototype, {
    body: {
        enumerable: true
    },
    bodyUsed: {
        enumerable: true
    },
    arrayBuffer: {
        enumerable: true
    },
    blob: {
        enumerable: true
    },
    json: {
        enumerable: true
    },
    text: {
        enumerable: true
    },
    data: {
        get: (0, $53f36$deprecate)(()=>{}, "data doesn't exist, use json(), text(), arrayBuffer(), or body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (response)")
    }
});
/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return Promise
 */ async function $6fccded033b67de9$var$consumeBody(data) {
    if (data[$6fccded033b67de9$var$INTERNALS].disturbed) throw new TypeError(`body used already for: ${data.url}`);
    data[$6fccded033b67de9$var$INTERNALS].disturbed = true;
    if (data[$6fccded033b67de9$var$INTERNALS].error) throw data[$6fccded033b67de9$var$INTERNALS].error;
    const { body: body  } = data;
    // Body is null
    if (body === null) return (0, $53f36$Buffer).alloc(0);
    /* c8 ignore next 3 */ if (!(body instanceof (0, $53f36$nodestream))) return (0, $53f36$Buffer).alloc(0);
    // Body is stream
    // get ready to actually consume the body
    const accum = [];
    let accumBytes = 0;
    try {
        for await (const chunk of body){
            if (data.size > 0 && accumBytes + chunk.length > data.size) {
                const error = new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`content size at ${data.url} over limit: ${data.size}`, "max-size");
                body.destroy(error);
                throw error;
            }
            accumBytes += chunk.length;
            accum.push(chunk);
        }
    } catch (error) {
        const error_ = error instanceof (0, $1bad95c2743e9fdb$export$359423e5a663266f) ? error : new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, "system", error);
        throw error_;
    }
    if (body.readableEnded === true || body._readableState.ended === true) try {
        if (accum.every((c)=>typeof c === "string")) return (0, $53f36$Buffer).from(accum.join(""));
        return (0, $53f36$Buffer).concat(accum, accumBytes);
    } catch (error) {
        throw new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`Could not create Buffer from response body for ${data.url}: ${error.message}`, "system", error);
    }
    else throw new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`Premature close of server response while trying to fetch ${data.url}`);
}
const $6fccded033b67de9$export$9cd59f9826255e47 = (instance, highWaterMark)=>{
    let p1;
    let p2;
    let { body: body  } = instance[$6fccded033b67de9$var$INTERNALS];
    // Don't allow cloning a used body
    if (instance.bodyUsed) throw new Error("cannot clone body after it is used");
    // Check that body is a stream and not form-data object
    // note: we can't clone the form-data object without having it as a dependency
    if (body instanceof (0, $53f36$nodestream) && typeof body.getBoundary !== "function") {
        // Tee instance body
        p1 = new (0, $53f36$PassThrough)({
            highWaterMark: highWaterMark
        });
        p2 = new (0, $53f36$PassThrough)({
            highWaterMark: highWaterMark
        });
        body.pipe(p1);
        body.pipe(p2);
        // Set instance body to teed body and return the other teed body
        instance[$6fccded033b67de9$var$INTERNALS].stream = p1;
        body = p2;
    }
    return body;
};
const $6fccded033b67de9$var$getNonSpecFormDataBoundary = (0, $53f36$deprecate)((body)=>body.getBoundary(), "form-data doesn't follow the spec and requires special treatment. Use alternative package", "https://github.com/node-fetch/node-fetch/issues/1167");
const $6fccded033b67de9$export$2b9b51eb2e7a33e6 = (body, request)=>{
    // Body is null or undefined
    if (body === null) return null;
    // Body is string
    if (typeof body === "string") return "text/plain;charset=UTF-8";
    // Body is a URLSearchParams
    if ((0, $7ab3eb0015307789$export$403f486803bfc6ff)(body)) return "application/x-www-form-urlencoded;charset=UTF-8";
    // Body is blob
    if ((0, $7ab3eb0015307789$export$5bcd6e94ed871c88)(body)) return body.type || null;
    // Body is a Buffer (Buffer, ArrayBuffer or ArrayBufferView)
    if ((0, $53f36$Buffer).isBuffer(body) || (0, $53f36$types).isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) return null;
    if (body instanceof (0, $jw5hj.FormData)) return `multipart/form-data; boundary=${request[$6fccded033b67de9$var$INTERNALS].boundary}`;
    // Detect form data input from form-data module
    if (body && typeof body.getBoundary === "function") return `multipart/form-data;boundary=${$6fccded033b67de9$var$getNonSpecFormDataBoundary(body)}`;
    // Body is stream - can't really do much about this
    if (body instanceof (0, $53f36$nodestream)) return null;
    // Body constructor defaults other things to string
    return "text/plain;charset=UTF-8";
};
const $6fccded033b67de9$export$6ea4452c6ae2956f = (request)=>{
    const { body: body  } = request[$6fccded033b67de9$var$INTERNALS];
    // Body is null or undefined
    if (body === null) return 0;
    // Body is Blob
    if ((0, $7ab3eb0015307789$export$5bcd6e94ed871c88)(body)) return body.size;
    // Body is Buffer
    if ((0, $53f36$Buffer).isBuffer(body)) return body.length;
    // Detect form data input from form-data module
    if (body && typeof body.getLengthSync === "function") return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
    // Body is stream
    return null;
};
const $6fccded033b67de9$export$df92035d47a0b6a3 = async (dest, { body: body  })=>{
    if (body === null) // Body is null
    dest.end();
    else // Body is stream
    await $6fccded033b67de9$var$pipeline(body, dest);
};


/**
 * Response.js
 *
 * Response class provides content decoding
 */ /**
 * Headers.js
 *
 * Headers class offers convenient helpers
 */ 

/* c8 ignore next 9 */ const $e1dbc6f16365e540$var$validateHeaderName = typeof (0, $53f36$nodehttp).validateHeaderName === "function" ? (0, $53f36$nodehttp).validateHeaderName : (name)=>{
    if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const error = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(error, "code", {
            value: "ERR_INVALID_HTTP_TOKEN"
        });
        throw error;
    }
};
/* c8 ignore next 9 */ const $e1dbc6f16365e540$var$validateHeaderValue = typeof (0, $53f36$nodehttp).validateHeaderValue === "function" ? (0, $53f36$nodehttp).validateHeaderValue : (name, value)=>{
    if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(error, "code", {
            value: "ERR_INVALID_CHAR"
        });
        throw error;
    }
};
class $e1dbc6f16365e540$export$2e2bcd8739ae039 extends URLSearchParams {
    /**
	 * Headers class
	 *
	 * @constructor
	 * @param {HeadersInit} [init] - Response headers
	 */ constructor(init){
        // Validate and normalize init object in [name, value(s)][]
        /** @type {string[][]} */ let result = [];
        if (init instanceof $e1dbc6f16365e540$export$2e2bcd8739ae039) {
            const raw = init.raw();
            for (const [name, values] of Object.entries(raw))result.push(...values.map((value)=>[
                    name,
                    value
                ]));
        } else if (init == null) ;
        else if (typeof init === "object" && !(0, $53f36$types).isBoxedPrimitive(init)) {
            const method = init[Symbol.iterator];
            // eslint-disable-next-line no-eq-null, eqeqeq
            if (method == null) // Record<ByteString, ByteString>
            result.push(...Object.entries(init));
            else {
                if (typeof method !== "function") throw new TypeError("Header pairs must be iterable");
                // Sequence<sequence<ByteString>>
                // Note: per spec we have to first exhaust the lists then process them
                result = [
                    ...init
                ].map((pair)=>{
                    if (typeof pair !== "object" || (0, $53f36$types).isBoxedPrimitive(pair)) throw new TypeError("Each header pair must be an iterable object");
                    return [
                        ...pair
                    ];
                }).map((pair)=>{
                    if (pair.length !== 2) throw new TypeError("Each header pair must be a name/value tuple");
                    return [
                        ...pair
                    ];
                });
            }
        } else throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        // Validate and lowercase
        result = result.length > 0 ? result.map(([name, value])=>{
            $e1dbc6f16365e540$var$validateHeaderName(name);
            $e1dbc6f16365e540$var$validateHeaderValue(name, String(value));
            return [
                String(name).toLowerCase(),
                String(value)
            ];
        }) : undefined;
        super(result);
        // Returning a Proxy that will lowercase key names, validate parameters and sort keys
        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get (target, p, receiver) {
                switch(p){
                    case "append":
                    case "set":
                        return (name, value)=>{
                            $e1dbc6f16365e540$var$validateHeaderName(name);
                            $e1dbc6f16365e540$var$validateHeaderValue(name, String(value));
                            return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
                        };
                    case "delete":
                    case "has":
                    case "getAll":
                        return (name)=>{
                            $e1dbc6f16365e540$var$validateHeaderName(name);
                            return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
                        };
                    case "keys":
                        return ()=>{
                            target.sort();
                            return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                        };
                    default:
                        return Reflect.get(target, p, receiver);
                }
            }
        });
    /* c8 ignore next */ }
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
    toString() {
        return Object.prototype.toString.call(this);
    }
    get(name) {
        const values = this.getAll(name);
        if (values.length === 0) return null;
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) value = value.toLowerCase();
        return value;
    }
    forEach(callback, thisArg) {
        for (const name of this.keys())Reflect.apply(callback, thisArg, [
            this.get(name),
            name,
            this
        ]);
    }
    *values() {
        for (const name of this.keys())yield this.get(name);
    }
    /**
	 * @type {() => IterableIterator<[string, string]>}
	 */ *entries() {
        for (const name of this.keys())yield [
            name,
            this.get(name)
        ];
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    /**
	 * Node-fetch non-spec method
	 * returning all headers and their values as array
	 * @returns {Record<string, string[]>}
	 */ raw() {
        return [
            ...this.keys()
        ].reduce((result, key)=>{
            result[key] = this.getAll(key);
            return result;
        }, {});
    }
    /**
	 * For better console.log(headers) and also to convert Headers into Node.js Request compatible format
	 */ [Symbol.for("nodejs.util.inspect.custom")]() {
        return [
            ...this.keys()
        ].reduce((result, key)=>{
            const values = this.getAll(key);
            // Http.request() only supports string as Host header.
            // This hack makes specifying custom Host header possible.
            if (key === "host") result[key] = values[0];
            else result[key] = values.length > 1 ? values : values[0];
            return result;
        }, {});
    }
}
/**
 * Re-shaping object for Web IDL tests
 * Only need to do it for overridden methods
 */ Object.defineProperties($e1dbc6f16365e540$export$2e2bcd8739ae039.prototype, [
    "get",
    "entries",
    "forEach",
    "values"
].reduce((result, property)=>{
    result[property] = {
        enumerable: true
    };
    return result;
}, {}));
function $e1dbc6f16365e540$export$8c3dd7dbe8ad5e3e(headers = []) {
    return new $e1dbc6f16365e540$export$2e2bcd8739ae039(headers// Split into pairs
    .reduce((result, value, index, array)=>{
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
    }, []).filter(([name, value])=>{
        try {
            $e1dbc6f16365e540$var$validateHeaderName(name);
            $e1dbc6f16365e540$var$validateHeaderValue(name, String(value));
            return true;
        } catch  {
            return false;
        }
    }));
}



const $195e78401b6a3f1f$var$redirectStatus = new Set([
    301,
    302,
    303,
    307,
    308
]);
const $195e78401b6a3f1f$export$4cb830d4f7e56898 = (code)=>{
    return $195e78401b6a3f1f$var$redirectStatus.has(code);
};


const $4a7762373e322804$var$INTERNALS = Symbol("Response internals");
class $4a7762373e322804$export$2e2bcd8739ae039 extends (0, $6fccded033b67de9$export$2e2bcd8739ae039) {
    constructor(body = null, options = {}){
        super(body, options);
        // eslint-disable-next-line no-eq-null, eqeqeq, no-negated-condition
        const status = options.status != null ? options.status : 200;
        const headers = new (0, $e1dbc6f16365e540$export$2e2bcd8739ae039)(options.headers);
        if (body !== null && !headers.has("Content-Type")) {
            const contentType = (0, $6fccded033b67de9$export$2b9b51eb2e7a33e6)(body, this);
            if (contentType) headers.append("Content-Type", contentType);
        }
        this[$4a7762373e322804$var$INTERNALS] = {
            type: "default",
            url: options.url,
            status: status,
            statusText: options.statusText || "",
            headers: headers,
            counter: options.counter,
            highWaterMark: options.highWaterMark
        };
    }
    get type() {
        return this[$4a7762373e322804$var$INTERNALS].type;
    }
    get url() {
        return this[$4a7762373e322804$var$INTERNALS].url || "";
    }
    get status() {
        return this[$4a7762373e322804$var$INTERNALS].status;
    }
    /**
	 * Convenience property representing if the request ended normally
	 */ get ok() {
        return this[$4a7762373e322804$var$INTERNALS].status >= 200 && this[$4a7762373e322804$var$INTERNALS].status < 300;
    }
    get redirected() {
        return this[$4a7762373e322804$var$INTERNALS].counter > 0;
    }
    get statusText() {
        return this[$4a7762373e322804$var$INTERNALS].statusText;
    }
    get headers() {
        return this[$4a7762373e322804$var$INTERNALS].headers;
    }
    get highWaterMark() {
        return this[$4a7762373e322804$var$INTERNALS].highWaterMark;
    }
    /**
	 * Clone this response
	 *
	 * @return  Response
	 */ clone() {
        return new $4a7762373e322804$export$2e2bcd8739ae039((0, $6fccded033b67de9$export$9cd59f9826255e47)(this, this.highWaterMark), {
            type: this.type,
            url: this.url,
            status: this.status,
            statusText: this.statusText,
            headers: this.headers,
            ok: this.ok,
            redirected: this.redirected,
            size: this.size,
            highWaterMark: this.highWaterMark
        });
    }
    /**
	 * @param {string} url    The URL that the new response is to originate from.
	 * @param {number} status An optional status code for the response (e.g., 302.)
	 * @returns {Response}    A Response object.
	 */ static redirect(url, status = 302) {
        if (!(0, $195e78401b6a3f1f$export$4cb830d4f7e56898)(status)) throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        return new $4a7762373e322804$export$2e2bcd8739ae039(null, {
            headers: {
                location: new URL(url).toString()
            },
            status: status
        });
    }
    static error() {
        const response = new $4a7762373e322804$export$2e2bcd8739ae039(null, {
            status: 0,
            statusText: ""
        });
        response[$4a7762373e322804$var$INTERNALS].type = "error";
        return response;
    }
    static json(data, init = {}) {
        const body = JSON.stringify(data);
        if (body === undefined) throw new TypeError("data is not JSON serializable");
        const headers = new (0, $e1dbc6f16365e540$export$2e2bcd8739ae039)(init && init.headers);
        if (!headers.has("content-type")) headers.set("content-type", "application/json");
        return new $4a7762373e322804$export$2e2bcd8739ae039(body, {
            ...init,
            headers: headers
        });
    }
    get [Symbol.toStringTag]() {
        return "Response";
    }
}
Object.defineProperties($4a7762373e322804$export$2e2bcd8739ae039.prototype, {
    type: {
        enumerable: true
    },
    url: {
        enumerable: true
    },
    status: {
        enumerable: true
    },
    ok: {
        enumerable: true
    },
    redirected: {
        enumerable: true
    },
    statusText: {
        enumerable: true
    },
    headers: {
        enumerable: true
    },
    clone: {
        enumerable: true
    }
});



/**
 * Request.js
 *
 * Request class contains server only options
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */ 




const $7bce3e3686b03a67$export$786f9a4bc80cc6b0 = (parsedURL)=>{
    if (parsedURL.search) return parsedURL.search;
    const lastOffset = parsedURL.href.length - 1;
    const hash = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
    return parsedURL.href[lastOffset - hash.length] === "?" ? "?" : "";
};



function $0a95cf38b87bec22$export$fde0b49925f91fce(url, originOnly = false) {
    // 1. If url is null, return no referrer.
    if (url == null) return "no-referrer";
    url = new URL(url);
    // 2. If url's scheme is a local scheme, then return no referrer.
    if (/^(about|blob|data):$/.test(url.protocol)) return "no-referrer";
    // 3. Set url's username to the empty string.
    url.username = "";
    // 4. Set url's password to null.
    // Note: `null` appears to be a mistake as this actually results in the password being `"null"`.
    url.password = "";
    // 5. Set url's fragment to null.
    // Note: `null` appears to be a mistake as this actually results in the fragment being `"#null"`.
    url.hash = "";
    // 6. If the origin-only flag is true, then:
    if (originOnly) {
        // 6.1. Set url's path to null.
        // Note: `null` appears to be a mistake as this actually results in the path being `"/null"`.
        url.pathname = "";
        // 6.2. Set url's query to null.
        // Note: `null` appears to be a mistake as this actually results in the query being `"?null"`.
        url.search = "";
    }
    // 7. Return url.
    return url;
}
const $0a95cf38b87bec22$export$64a0787db794a809 = new Set([
    "",
    "no-referrer",
    "no-referrer-when-downgrade",
    "same-origin",
    "origin",
    "strict-origin",
    "origin-when-cross-origin",
    "strict-origin-when-cross-origin",
    "unsafe-url"
]);
const $0a95cf38b87bec22$export$69cb217583b60dbe = "strict-origin-when-cross-origin";
function $0a95cf38b87bec22$export$840c90fd8051a475(referrerPolicy) {
    if (!$0a95cf38b87bec22$export$64a0787db794a809.has(referrerPolicy)) throw new TypeError(`Invalid referrerPolicy: ${referrerPolicy}`);
    return referrerPolicy;
}
function $0a95cf38b87bec22$export$6499a3a808b93780(url) {
    // 1. If origin is an opaque origin, return "Not Trustworthy".
    // Not applicable
    // 2. Assert: origin is a tuple origin.
    // Not for implementations
    // 3. If origin's scheme is either "https" or "wss", return "Potentially Trustworthy".
    if (/^(http|ws)s:$/.test(url.protocol)) return true;
    // 4. If origin's host component matches one of the CIDR notations 127.0.0.0/8 or ::1/128 [RFC4632], return "Potentially Trustworthy".
    const hostIp = url.host.replace(/(^\[)|(]$)/g, "");
    const hostIPVersion = (0, $53f36$isIP)(hostIp);
    if (hostIPVersion === 4 && /^127\./.test(hostIp)) return true;
    if (hostIPVersion === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(hostIp)) return true;
    // 5. If origin's host component is "localhost" or falls within ".localhost", and the user agent conforms to the name resolution rules in [let-localhost-be-localhost], return "Potentially Trustworthy".
    // We are returning FALSE here because we cannot ensure conformance to
    // let-localhost-be-loalhost (https://tools.ietf.org/html/draft-west-let-localhost-be-localhost)
    if (url.host === "localhost" || url.host.endsWith(".localhost")) return false;
    // 6. If origin's scheme component is file, return "Potentially Trustworthy".
    if (url.protocol === "file:") return true;
    // 7. If origin's scheme component is one which the user agent considers to be authenticated, return "Potentially Trustworthy".
    // Not supported
    // 8. If origin has been configured as a trustworthy origin, return "Potentially Trustworthy".
    // Not supported
    // 9. Return "Not Trustworthy".
    return false;
}
function $0a95cf38b87bec22$export$120341f873018e7b(url) {
    // 1. If url is "about:blank" or "about:srcdoc", return "Potentially Trustworthy".
    if (/^about:(blank|srcdoc)$/.test(url)) return true;
    // 2. If url's scheme is "data", return "Potentially Trustworthy".
    if (url.protocol === "data:") return true;
    // Note: The origin of blob: and filesystem: URLs is the origin of the context in which they were
    // created. Therefore, blobs created in a trustworthy origin will themselves be potentially
    // trustworthy.
    if (/^(blob|filesystem):$/.test(url.protocol)) return true;
    // 3. Return the result of executing §3.2 Is origin potentially trustworthy? on url's origin.
    return $0a95cf38b87bec22$export$6499a3a808b93780(url);
}
function $0a95cf38b87bec22$export$d13d6247dda1a179(request, { referrerURLCallback: referrerURLCallback , referrerOriginCallback: referrerOriginCallback  } = {}) {
    // There are 2 notes in the specification about invalid pre-conditions.  We return null, here, for
    // these cases:
    // > Note: If request's referrer is "no-referrer", Fetch will not call into this algorithm.
    // > Note: If request's referrer policy is the empty string, Fetch will not call into this
    // > algorithm.
    if (request.referrer === "no-referrer" || request.referrerPolicy === "") return null;
    // 1. Let policy be request's associated referrer policy.
    const policy = request.referrerPolicy;
    // 2. Let environment be request's client.
    // not applicable to node.js
    // 3. Switch on request's referrer:
    if (request.referrer === "about:client") return "no-referrer";
    // "a URL": Let referrerSource be request's referrer.
    const referrerSource = request.referrer;
    // 4. Let request's referrerURL be the result of stripping referrerSource for use as a referrer.
    let referrerURL = $0a95cf38b87bec22$export$fde0b49925f91fce(referrerSource);
    // 5. Let referrerOrigin be the result of stripping referrerSource for use as a referrer, with the
    //    origin-only flag set to true.
    let referrerOrigin = $0a95cf38b87bec22$export$fde0b49925f91fce(referrerSource, true);
    // 6. If the result of serializing referrerURL is a string whose length is greater than 4096, set
    //    referrerURL to referrerOrigin.
    if (referrerURL.toString().length > 4096) referrerURL = referrerOrigin;
    // 7. The user agent MAY alter referrerURL or referrerOrigin at this point to enforce arbitrary
    //    policy considerations in the interests of minimizing data leakage. For example, the user
    //    agent could strip the URL down to an origin, modify its host, replace it with an empty
    //    string, etc.
    if (referrerURLCallback) referrerURL = referrerURLCallback(referrerURL);
    if (referrerOriginCallback) referrerOrigin = referrerOriginCallback(referrerOrigin);
    // 8.Execute the statements corresponding to the value of policy:
    const currentURL = new URL(request.url);
    switch(policy){
        case "no-referrer":
            return "no-referrer";
        case "origin":
            return referrerOrigin;
        case "unsafe-url":
            return referrerURL;
        case "strict-origin":
            // 1. If referrerURL is a potentially trustworthy URL and request's current URL is not a
            //    potentially trustworthy URL, then return no referrer.
            if ($0a95cf38b87bec22$export$120341f873018e7b(referrerURL) && !$0a95cf38b87bec22$export$120341f873018e7b(currentURL)) return "no-referrer";
            // 2. Return referrerOrigin.
            return referrerOrigin.toString();
        case "strict-origin-when-cross-origin":
            // 1. If the origin of referrerURL and the origin of request's current URL are the same, then
            //    return referrerURL.
            if (referrerURL.origin === currentURL.origin) return referrerURL;
            // 2. If referrerURL is a potentially trustworthy URL and request's current URL is not a
            //    potentially trustworthy URL, then return no referrer.
            if ($0a95cf38b87bec22$export$120341f873018e7b(referrerURL) && !$0a95cf38b87bec22$export$120341f873018e7b(currentURL)) return "no-referrer";
            // 3. Return referrerOrigin.
            return referrerOrigin;
        case "same-origin":
            // 1. If the origin of referrerURL and the origin of request's current URL are the same, then
            //    return referrerURL.
            if (referrerURL.origin === currentURL.origin) return referrerURL;
            // 2. Return no referrer.
            return "no-referrer";
        case "origin-when-cross-origin":
            // 1. If the origin of referrerURL and the origin of request's current URL are the same, then
            //    return referrerURL.
            if (referrerURL.origin === currentURL.origin) return referrerURL;
            // Return referrerOrigin.
            return referrerOrigin;
        case "no-referrer-when-downgrade":
            // 1. If referrerURL is a potentially trustworthy URL and request's current URL is not a
            //    potentially trustworthy URL, then return no referrer.
            if ($0a95cf38b87bec22$export$120341f873018e7b(referrerURL) && !$0a95cf38b87bec22$export$120341f873018e7b(currentURL)) return "no-referrer";
            // 2. Return referrerURL.
            return referrerURL;
        default:
            throw new TypeError(`Invalid referrerPolicy: ${policy}`);
    }
}
function $0a95cf38b87bec22$export$761ed3bd86bd3c9(headers) {
    // 1. Let policy-tokens be the result of extracting header list values given `Referrer-Policy`
    //    and response’s header list.
    const policyTokens = (headers.get("referrer-policy") || "").split(/[,\s]+/);
    // 2. Let policy be the empty string.
    let policy = "";
    // 3. For each token in policy-tokens, if token is a referrer policy and token is not the empty
    //    string, then set policy to token.
    // Note: This algorithm loops over multiple policy values to allow deployment of new policy
    // values with fallbacks for older user agents, as described in § 11.1 Unknown Policy Values.
    for (const token of policyTokens)if (token && $0a95cf38b87bec22$export$64a0787db794a809.has(token)) policy = token;
    // 4. Return policy.
    return policy;
}


const $c33aaa314ccc7bc0$var$INTERNALS = Symbol("Request internals");
/**
 * Check if `obj` is an instance of Request.
 *
 * @param  {*} object
 * @return {boolean}
 */ const $c33aaa314ccc7bc0$var$isRequest = (object)=>{
    return typeof object === "object" && typeof object[$c33aaa314ccc7bc0$var$INTERNALS] === "object";
};
const $c33aaa314ccc7bc0$var$doBadDataWarn = (0, $53f36$deprecate)(()=>{}, ".data is not a valid RequestInit property, use .body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (request)");
class $c33aaa314ccc7bc0$export$2e2bcd8739ae039 extends (0, $6fccded033b67de9$export$2e2bcd8739ae039) {
    constructor(input, init = {}){
        let parsedURL;
        // Normalize input and force URL to be encoded as UTF-8 (https://github.com/node-fetch/node-fetch/issues/245)
        if ($c33aaa314ccc7bc0$var$isRequest(input)) parsedURL = new URL(input.url);
        else {
            parsedURL = new URL(input);
            input = {};
        }
        if (parsedURL.username !== "" || parsedURL.password !== "") throw new TypeError(`${parsedURL} is an url with embedded credentials.`);
        let method = init.method || input.method || "GET";
        if (/^(delete|get|head|options|post|put)$/i.test(method)) method = method.toUpperCase();
        if (!$c33aaa314ccc7bc0$var$isRequest(init) && "data" in init) $c33aaa314ccc7bc0$var$doBadDataWarn();
        // eslint-disable-next-line no-eq-null, eqeqeq
        if ((init.body != null || $c33aaa314ccc7bc0$var$isRequest(input) && input.body !== null) && (method === "GET" || method === "HEAD")) throw new TypeError("Request with GET/HEAD method cannot have body");
        const inputBody = init.body ? init.body : $c33aaa314ccc7bc0$var$isRequest(input) && input.body !== null ? (0, $6fccded033b67de9$export$9cd59f9826255e47)(input) : null;
        super(inputBody, {
            size: init.size || input.size || 0
        });
        const headers = new (0, $e1dbc6f16365e540$export$2e2bcd8739ae039)(init.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
            const contentType = (0, $6fccded033b67de9$export$2b9b51eb2e7a33e6)(inputBody, this);
            if (contentType) headers.set("Content-Type", contentType);
        }
        let signal = $c33aaa314ccc7bc0$var$isRequest(input) ? input.signal : null;
        if ("signal" in init) signal = init.signal;
        // eslint-disable-next-line no-eq-null, eqeqeq
        if (signal != null && !(0, $7ab3eb0015307789$export$8fb8889db6ef9202)(signal)) throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
        // §5.4, Request constructor steps, step 15.1
        // eslint-disable-next-line no-eq-null, eqeqeq
        let referrer = init.referrer == null ? input.referrer : init.referrer;
        if (referrer === "") // §5.4, Request constructor steps, step 15.2
        referrer = "no-referrer";
        else if (referrer) {
            // §5.4, Request constructor steps, step 15.3.1, 15.3.2
            const parsedReferrer = new URL(referrer);
            // §5.4, Request constructor steps, step 15.3.3, 15.3.4
            referrer = /^about:(\/\/)?client$/.test(parsedReferrer) ? "client" : parsedReferrer;
        } else referrer = undefined;
        this[$c33aaa314ccc7bc0$var$INTERNALS] = {
            method: method,
            redirect: init.redirect || input.redirect || "follow",
            headers: headers,
            parsedURL: parsedURL,
            signal: signal,
            referrer: referrer
        };
        // Node-fetch-only options
        this.follow = init.follow === undefined ? input.follow === undefined ? 20 : input.follow : init.follow;
        this.compress = init.compress === undefined ? input.compress === undefined ? true : input.compress : init.compress;
        this.counter = init.counter || input.counter || 0;
        this.agent = init.agent || input.agent;
        this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;
        // §5.4, Request constructor steps, step 16.
        // Default is empty string per https://fetch.spec.whatwg.org/#concept-request-referrer-policy
        this.referrerPolicy = init.referrerPolicy || input.referrerPolicy || "";
    }
    /** @returns {string} */ get method() {
        return this[$c33aaa314ccc7bc0$var$INTERNALS].method;
    }
    /** @returns {string} */ get url() {
        return (0, $53f36$format)(this[$c33aaa314ccc7bc0$var$INTERNALS].parsedURL);
    }
    /** @returns {Headers} */ get headers() {
        return this[$c33aaa314ccc7bc0$var$INTERNALS].headers;
    }
    get redirect() {
        return this[$c33aaa314ccc7bc0$var$INTERNALS].redirect;
    }
    /** @returns {AbortSignal} */ get signal() {
        return this[$c33aaa314ccc7bc0$var$INTERNALS].signal;
    }
    // https://fetch.spec.whatwg.org/#dom-request-referrer
    get referrer() {
        if (this[$c33aaa314ccc7bc0$var$INTERNALS].referrer === "no-referrer") return "";
        if (this[$c33aaa314ccc7bc0$var$INTERNALS].referrer === "client") return "about:client";
        if (this[$c33aaa314ccc7bc0$var$INTERNALS].referrer) return this[$c33aaa314ccc7bc0$var$INTERNALS].referrer.toString();
        return undefined;
    }
    get referrerPolicy() {
        return this[$c33aaa314ccc7bc0$var$INTERNALS].referrerPolicy;
    }
    set referrerPolicy(referrerPolicy) {
        this[$c33aaa314ccc7bc0$var$INTERNALS].referrerPolicy = (0, $0a95cf38b87bec22$export$840c90fd8051a475)(referrerPolicy);
    }
    /**
	 * Clone this request
	 *
	 * @return  Request
	 */ clone() {
        return new $c33aaa314ccc7bc0$export$2e2bcd8739ae039(this);
    }
    get [Symbol.toStringTag]() {
        return "Request";
    }
}
Object.defineProperties($c33aaa314ccc7bc0$export$2e2bcd8739ae039.prototype, {
    method: {
        enumerable: true
    },
    url: {
        enumerable: true
    },
    headers: {
        enumerable: true
    },
    redirect: {
        enumerable: true
    },
    clone: {
        enumerable: true
    },
    signal: {
        enumerable: true
    },
    referrer: {
        enumerable: true
    },
    referrerPolicy: {
        enumerable: true
    }
});
const $c33aaa314ccc7bc0$export$a9a3332d4dbf466c = (request)=>{
    const { parsedURL: parsedURL  } = request[$c33aaa314ccc7bc0$var$INTERNALS];
    const headers = new (0, $e1dbc6f16365e540$export$2e2bcd8739ae039)(request[$c33aaa314ccc7bc0$var$INTERNALS].headers);
    // Fetch step 1.3
    if (!headers.has("Accept")) headers.set("Accept", "*/*");
    // HTTP-network-or-cache fetch steps 2.4-2.7
    let contentLengthValue = null;
    if (request.body === null && /^(post|put)$/i.test(request.method)) contentLengthValue = "0";
    if (request.body !== null) {
        const totalBytes = (0, $6fccded033b67de9$export$6ea4452c6ae2956f)(request);
        // Set Content-Length if totalBytes is a number (that is not NaN)
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) contentLengthValue = String(totalBytes);
    }
    if (contentLengthValue) headers.set("Content-Length", contentLengthValue);
    // 4.1. Main fetch, step 2.6
    // > If request's referrer policy is the empty string, then set request's referrer policy to the
    // > default referrer policy.
    if (request.referrerPolicy === "") request.referrerPolicy = (0, $0a95cf38b87bec22$export$69cb217583b60dbe);
    // 4.1. Main fetch, step 2.7
    // > If request's referrer is not "no-referrer", set request's referrer to the result of invoking
    // > determine request's referrer.
    if (request.referrer && request.referrer !== "no-referrer") request[$c33aaa314ccc7bc0$var$INTERNALS].referrer = (0, $0a95cf38b87bec22$export$d13d6247dda1a179)(request);
    else request[$c33aaa314ccc7bc0$var$INTERNALS].referrer = "no-referrer";
    // 4.5. HTTP-network-or-cache fetch, step 6.9
    // > If httpRequest's referrer is a URL, then append `Referer`/httpRequest's referrer, serialized
    // >  and isomorphic encoded, to httpRequest's header list.
    if (request[$c33aaa314ccc7bc0$var$INTERNALS].referrer instanceof URL) headers.set("Referer", request.referrer);
    // HTTP-network-or-cache fetch step 2.11
    if (!headers.has("User-Agent")) headers.set("User-Agent", "node-fetch");
    // HTTP-network-or-cache fetch step 2.15
    if (request.compress && !headers.has("Accept-Encoding")) headers.set("Accept-Encoding", "gzip, deflate, br");
    let { agent: agent  } = request;
    if (typeof agent === "function") agent = agent(parsedURL);
    if (!headers.has("Connection") && !agent) headers.set("Connection", "close");
    // HTTP-network fetch step 4.2
    // chunked encoding is handled by Node.js
    const search = (0, $7bce3e3686b03a67$export$786f9a4bc80cc6b0)(parsedURL);
    // Pass the full URL directly to request(), but overwrite the following
    // options:
    const options = {
        // Overwrite search to retain trailing ? (issue #776)
        path: parsedURL.pathname + search,
        // The following options are not expressed in the URL
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent: agent
    };
    return {
        parsedURL: /** @type {URL} */ parsedURL,
        options: options
    };
};




class $2d17a2c83c8da708$export$18b052ffd8c84d7 extends (0, $1bad95c2743e9fdb$export$359423e5a663266f) {
    constructor(message, type = "aborted"){
        super(message, type);
    }
}




var $jw5hj = parcelRequire("jw5hj");


parcelRequire("5L7Gm");
var $cIDq7 = parcelRequire("cIDq7");
var $d67T9 = parcelRequire("d67T9");
var $5L7Gm = parcelRequire("5L7Gm");

const $d0169d43d1e21383$var$supportedSchemas = new Set([
    "data:",
    "http:",
    "https:"
]);
async function $d0169d43d1e21383$export$2e2bcd8739ae039(url, options_) {
    return new Promise((resolve, reject)=>{
        // Build request object
        const request = new (0, $c33aaa314ccc7bc0$export$2e2bcd8739ae039)(url, options_);
        const { parsedURL: parsedURL , options: options  } = (0, $c33aaa314ccc7bc0$export$a9a3332d4dbf466c)(request);
        if (!$d0169d43d1e21383$var$supportedSchemas.has(parsedURL.protocol)) throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, "")}" is not supported.`);
        if (parsedURL.protocol === "data:") {
            const data = (0, $3742280dd51c6952$export$2e2bcd8739ae039)(request.url);
            const response = new (0, $4a7762373e322804$export$2e2bcd8739ae039)(data, {
                headers: {
                    "Content-Type": data.typeFull
                }
            });
            resolve(response);
            return;
        }
        // Wrap http.request into fetch
        const send = (parsedURL.protocol === "https:" ? (0, $53f36$nodehttps) : (0, $53f36$nodehttp)).request;
        const { signal: signal  } = request;
        let response = null;
        const abort = ()=>{
            const error = new (0, $2d17a2c83c8da708$export$18b052ffd8c84d7)("The operation was aborted.");
            reject(error);
            if (request.body && request.body instanceof (0, $53f36$nodestream).Readable) request.body.destroy(error);
            if (!response || !response.body) return;
            response.body.emit("error", error);
        };
        if (signal && signal.aborted) {
            abort();
            return;
        }
        const abortAndFinalize = ()=>{
            abort();
            finalize();
        };
        // Send request
        const request_ = send(parsedURL.toString(), options);
        if (signal) signal.addEventListener("abort", abortAndFinalize);
        const finalize = ()=>{
            request_.abort();
            if (signal) signal.removeEventListener("abort", abortAndFinalize);
        };
        request_.on("error", (error)=>{
            reject(new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`request to ${request.url} failed, reason: ${error.message}`, "system", error));
            finalize();
        });
        $d0169d43d1e21383$var$fixResponseChunkedTransferBadEnding(request_, (error)=>{
            if (response && response.body) response.body.destroy(error);
        });
        /* c8 ignore next 18 */ if ($53f36$version < "v14") // Before Node.js 14, pipeline() does not fully support async iterators and does not always
        // properly handle when the socket close/end events are out of order.
        request_.on("socket", (s)=>{
            let endedWithEventsCount;
            s.prependListener("end", ()=>{
                endedWithEventsCount = s._eventsCount;
            });
            s.prependListener("close", (hadError)=>{
                // if end happened before close but the socket didn't emit an error, do it now
                if (response && endedWithEventsCount < s._eventsCount && !hadError) {
                    const error = new Error("Premature close");
                    error.code = "ERR_STREAM_PREMATURE_CLOSE";
                    response.body.emit("error", error);
                }
            });
        });
        request_.on("response", (response_)=>{
            request_.setTimeout(0);
            const headers = (0, $e1dbc6f16365e540$export$8c3dd7dbe8ad5e3e)(response_.rawHeaders);
            // HTTP fetch step 5
            if ((0, $195e78401b6a3f1f$export$4cb830d4f7e56898)(response_.statusCode)) {
                // HTTP fetch step 5.2
                const location = headers.get("Location");
                // HTTP fetch step 5.3
                let locationURL = null;
                try {
                    locationURL = location === null ? null : new URL(location, request.url);
                } catch  {
                    // error here can only be invalid URL in Location: header
                    // do not throw when options.redirect == manual
                    // let the user extract the errorneous redirect URL
                    if (request.redirect !== "manual") {
                        reject(new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`uri requested responds with an invalid redirect URL: ${location}`, "invalid-redirect"));
                        finalize();
                        return;
                    }
                }
                // HTTP fetch step 5.5
                switch(request.redirect){
                    case "error":
                        reject(new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
                        finalize();
                        return;
                    case "manual":
                        break;
                    case "follow":
                        {
                            // HTTP-redirect fetch step 2
                            if (locationURL === null) break;
                            // HTTP-redirect fetch step 5
                            if (request.counter >= request.follow) {
                                reject(new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)(`maximum redirect reached at: ${request.url}`, "max-redirect"));
                                finalize();
                                return;
                            }
                            // HTTP-redirect fetch step 6 (counter increment)
                            // Create a new Request object.
                            const requestOptions = {
                                headers: new (0, $e1dbc6f16365e540$export$2e2bcd8739ae039)(request.headers),
                                follow: request.follow,
                                counter: request.counter + 1,
                                agent: request.agent,
                                compress: request.compress,
                                method: request.method,
                                body: (0, $6fccded033b67de9$export$9cd59f9826255e47)(request),
                                signal: request.signal,
                                size: request.size,
                                referrer: request.referrer,
                                referrerPolicy: request.referrerPolicy
                            };
                            // when forwarding sensitive headers like "Authorization",
                            // "WWW-Authenticate", and "Cookie" to untrusted targets,
                            // headers will be ignored when following a redirect to a domain
                            // that is not a subdomain match or exact match of the initial domain.
                            // For example, a redirect from "foo.com" to either "foo.com" or "sub.foo.com"
                            // will forward the sensitive headers, but a redirect to "bar.com" will not.
                            // headers will also be ignored when following a redirect to a domain using
                            // a different protocol. For example, a redirect from "https://foo.com" to "http://foo.com"
                            // will not forward the sensitive headers
                            if (!(0, $7ab3eb0015307789$export$f0f20af6002339ab)(request.url, locationURL) || !(0, $7ab3eb0015307789$export$b756189618c5d1d5)(request.url, locationURL)) for (const name of [
                                "authorization",
                                "www-authenticate",
                                "cookie",
                                "cookie2"
                            ])requestOptions.headers.delete(name);
                            // HTTP-redirect fetch step 9
                            if (response_.statusCode !== 303 && request.body && options_.body instanceof (0, $53f36$nodestream).Readable) {
                                reject(new (0, $e0e93397b613af1b$export$26e841bcf1aeb894)("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
                                finalize();
                                return;
                            }
                            // HTTP-redirect fetch step 11
                            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
                                requestOptions.method = "GET";
                                requestOptions.body = undefined;
                                requestOptions.headers.delete("content-length");
                            }
                            // HTTP-redirect fetch step 14
                            const responseReferrerPolicy = (0, $0a95cf38b87bec22$export$761ed3bd86bd3c9)(headers);
                            if (responseReferrerPolicy) requestOptions.referrerPolicy = responseReferrerPolicy;
                            // HTTP-redirect fetch step 15
                            resolve($d0169d43d1e21383$export$2e2bcd8739ae039(new (0, $c33aaa314ccc7bc0$export$2e2bcd8739ae039)(locationURL, requestOptions)));
                            finalize();
                            return;
                        }
                    default:
                        return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
                }
            }
            // Prepare response
            if (signal) response_.once("end", ()=>{
                signal.removeEventListener("abort", abortAndFinalize);
            });
            let body = (0, $53f36$pipeline)(response_, new (0, $53f36$PassThrough)(), (error)=>{
                if (error) reject(error);
            });
            // see https://github.com/nodejs/node/pull/29376
            /* c8 ignore next 3 */ if ($53f36$version < "v12.10") response_.on("aborted", abortAndFinalize);
            const responseOptions = {
                url: request.url,
                status: response_.statusCode,
                statusText: response_.statusMessage,
                headers: headers,
                size: request.size,
                counter: request.counter,
                highWaterMark: request.highWaterMark
            };
            // HTTP-network fetch step 12.1.1.3
            const codings = headers.get("Content-Encoding");
            // HTTP-network fetch step 12.1.1.4: handle content codings
            // in following scenarios we ignore compression support
            // 1. compression support is disabled
            // 2. HEAD request
            // 3. no Content-Encoding header
            // 4. no content response (204)
            // 5. content not modified response (304)
            if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
                response = new (0, $4a7762373e322804$export$2e2bcd8739ae039)(body, responseOptions);
                resolve(response);
                return;
            }
            // For Node v6+
            // Be less strict when decoding compressed responses, since sometimes
            // servers send slightly invalid responses that are still accepted
            // by common browsers.
            // Always using Z_SYNC_FLUSH is what cURL does.
            const zlibOptions = {
                flush: (0, $53f36$nodezlib).Z_SYNC_FLUSH,
                finishFlush: (0, $53f36$nodezlib).Z_SYNC_FLUSH
            };
            // For gzip
            if (codings === "gzip" || codings === "x-gzip") {
                body = (0, $53f36$pipeline)(body, (0, $53f36$nodezlib).createGunzip(zlibOptions), (error)=>{
                    if (error) reject(error);
                });
                response = new (0, $4a7762373e322804$export$2e2bcd8739ae039)(body, responseOptions);
                resolve(response);
                return;
            }
            // For deflate
            if (codings === "deflate" || codings === "x-deflate") {
                // Handle the infamous raw deflate response from old servers
                // a hack for old IIS and Apache servers
                const raw = (0, $53f36$pipeline)(response_, new (0, $53f36$PassThrough)(), (error)=>{
                    if (error) reject(error);
                });
                raw.once("data", (chunk)=>{
                    // See http://stackoverflow.com/questions/37519828
                    if ((chunk[0] & 0x0F) === 0x08) body = (0, $53f36$pipeline)(body, (0, $53f36$nodezlib).createInflate(), (error)=>{
                        if (error) reject(error);
                    });
                    else body = (0, $53f36$pipeline)(body, (0, $53f36$nodezlib).createInflateRaw(), (error)=>{
                        if (error) reject(error);
                    });
                    response = new (0, $4a7762373e322804$export$2e2bcd8739ae039)(body, responseOptions);
                    resolve(response);
                });
                raw.once("end", ()=>{
                    // Some old IIS servers return zero-length OK deflate responses, so
                    // 'data' is never emitted. See https://github.com/node-fetch/node-fetch/pull/903
                    if (!response) {
                        response = new (0, $4a7762373e322804$export$2e2bcd8739ae039)(body, responseOptions);
                        resolve(response);
                    }
                });
                return;
            }
            // For br
            if (codings === "br") {
                body = (0, $53f36$pipeline)(body, (0, $53f36$nodezlib).createBrotliDecompress(), (error)=>{
                    if (error) reject(error);
                });
                response = new (0, $4a7762373e322804$export$2e2bcd8739ae039)(body, responseOptions);
                resolve(response);
                return;
            }
            // Otherwise, use response as-is
            response = new (0, $4a7762373e322804$export$2e2bcd8739ae039)(body, responseOptions);
            resolve(response);
        });
        // eslint-disable-next-line promise/prefer-await-to-then
        (0, $6fccded033b67de9$export$df92035d47a0b6a3)(request_, request).catch(reject);
    });
}
function $d0169d43d1e21383$var$fixResponseChunkedTransferBadEnding(request, errorCallback) {
    const LAST_CHUNK = (0, $53f36$Buffer).from("0\r\n\r\n");
    let isChunkedTransfer = false;
    let properLastChunkReceived = false;
    let previousChunk;
    request.on("response", (response)=>{
        const { headers: headers  } = response;
        isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
    });
    request.on("socket", (socket)=>{
        const onSocketClose = ()=>{
            if (isChunkedTransfer && !properLastChunkReceived) {
                const error = new Error("Premature close");
                error.code = "ERR_STREAM_PREMATURE_CLOSE";
                errorCallback(error);
            }
        };
        const onData = (buf)=>{
            properLastChunkReceived = (0, $53f36$Buffer).compare(buf.slice(-5), LAST_CHUNK) === 0;
            // Sometimes final 0-length chunk and end of message code are in separate packets
            if (!properLastChunkReceived && previousChunk) properLastChunkReceived = (0, $53f36$Buffer).compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && (0, $53f36$Buffer).compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
            previousChunk = buf;
        };
        socket.prependListener("close", onSocketClose);
        socket.on("data", onData);
        request.on("close", ()=>{
            socket.removeListener("close", onSocketClose);
            socket.removeListener("data", onData);
        });
    });
}


var $f0d540db358c20b7$export$f566b60ae4e8e0b3;
(function(EstadoEnGarantia) {
    EstadoEnGarantia[EstadoEnGarantia["Aguascalientes"] = 500] = "Aguascalientes";
    EstadoEnGarantia[EstadoEnGarantia["Baja California"] = 3350] = "Baja California";
    EstadoEnGarantia[EstadoEnGarantia["Baja California Sur"] = 3350] = "Baja California Sur";
    EstadoEnGarantia[EstadoEnGarantia["Campeche"] = 575] = "Campeche";
    EstadoEnGarantia[EstadoEnGarantia["Chiapas"] = 500] = "Chiapas";
    EstadoEnGarantia[EstadoEnGarantia["Chihuahua"] = 500] = "Chihuahua";
    EstadoEnGarantia[EstadoEnGarantia["Ciudad de M\xe9xico"] = 500] = "Ciudad de M\xe9xico";
    EstadoEnGarantia[EstadoEnGarantia["Coahuila de Zaragoza"] = 500] = "Coahuila de Zaragoza";
    EstadoEnGarantia[EstadoEnGarantia["Colima"] = 500] = "Colima";
    EstadoEnGarantia[EstadoEnGarantia["Durango"] = 575] = "Durango";
    EstadoEnGarantia[EstadoEnGarantia["Guanajuato"] = 500] = "Guanajuato";
    EstadoEnGarantia[EstadoEnGarantia["Guerrero"] = 2050] = "Guerrero";
    EstadoEnGarantia[EstadoEnGarantia["Hidalgo"] = 1050] = "Hidalgo";
    EstadoEnGarantia[EstadoEnGarantia["Jalisco"] = 690] = "Jalisco";
    EstadoEnGarantia[EstadoEnGarantia["M\xe9xico"] = 500] = "M\xe9xico";
    EstadoEnGarantia[EstadoEnGarantia["Michoac\xe1n de Ocampo"] = 1950] = "Michoac\xe1n de Ocampo";
    EstadoEnGarantia[EstadoEnGarantia["Morelos"] = 500] = "Morelos";
    EstadoEnGarantia[EstadoEnGarantia["Nayarit"] = 500] = "Nayarit";
    EstadoEnGarantia[EstadoEnGarantia["Nuevo Le\xf3n"] = 575] = "Nuevo Le\xf3n";
    EstadoEnGarantia[EstadoEnGarantia["Oaxaca"] = 575] = "Oaxaca";
    EstadoEnGarantia[EstadoEnGarantia["Puebla"] = 1800] = "Puebla";
    EstadoEnGarantia[EstadoEnGarantia["Quer\xe9taro"] = 500] = "Quer\xe9taro";
    EstadoEnGarantia[EstadoEnGarantia["Quintana Roo"] = 1200] = "Quintana Roo";
    EstadoEnGarantia[EstadoEnGarantia["San Luis Potos\xed"] = 2200] = "San Luis Potos\xed";
    EstadoEnGarantia[EstadoEnGarantia["Sinaloa"] = 3200] = "Sinaloa";
    EstadoEnGarantia[EstadoEnGarantia["Sonora"] = 3000] = "Sonora";
    EstadoEnGarantia[EstadoEnGarantia["Tabasco"] = 575] = "Tabasco";
    EstadoEnGarantia[EstadoEnGarantia["Tamaulipas"] = 575] = "Tamaulipas";
    EstadoEnGarantia[EstadoEnGarantia["Tlaxcala"] = 1450] = "Tlaxcala";
    EstadoEnGarantia[EstadoEnGarantia["Veracruz de Ignacio de la Llave"] = 3200] = "Veracruz de Ignacio de la Llave";
    EstadoEnGarantia[EstadoEnGarantia["Yucat\xe1n"] = 3350] = "Yucat\xe1n";
    EstadoEnGarantia[EstadoEnGarantia["Zacatecas"] = 575] = "Zacatecas";
})($f0d540db358c20b7$export$f566b60ae4e8e0b3 || ($f0d540db358c20b7$export$f566b60ae4e8e0b3 = {}));
var $f0d540db358c20b7$export$4d1c8da1ae941898;
(function(EstadoFirma) {
    EstadoFirma[EstadoFirma["Aguascalientes"] = 5000] = "Aguascalientes";
    EstadoFirma[EstadoFirma["Baja California"] = 5000] = "Baja California";
    EstadoFirma[EstadoFirma["Baja California Sur"] = 5000] = "Baja California Sur";
    EstadoFirma[EstadoFirma["Campeche"] = 5000] = "Campeche";
    EstadoFirma[EstadoFirma["Chiapas"] = 5000] = "Chiapas";
    EstadoFirma[EstadoFirma["Chihuahua"] = 5000] = "Chihuahua";
    EstadoFirma[EstadoFirma["Ciudad de M\xe9xico"] = 300] = "Ciudad de M\xe9xico";
    EstadoFirma[EstadoFirma["Coahuila de Zaragoza"] = 5000] = "Coahuila de Zaragoza";
    EstadoFirma[EstadoFirma["Colima"] = 5000] = "Colima";
    EstadoFirma[EstadoFirma["Durango"] = 5000] = "Durango";
    EstadoFirma[EstadoFirma["Guanajuato"] = 5000] = "Guanajuato";
    EstadoFirma[EstadoFirma["Guerrero"] = 5000] = "Guerrero";
    EstadoFirma[EstadoFirma["Hidalgo"] = 5000] = "Hidalgo";
    EstadoFirma[EstadoFirma["Jalisco"] = 5000] = "Jalisco";
    EstadoFirma[EstadoFirma["M\xe9xico"] = 350] = "M\xe9xico";
    EstadoFirma[EstadoFirma["Michoac\xe1n de Ocampo"] = 5000] = "Michoac\xe1n de Ocampo";
    EstadoFirma[EstadoFirma["Morelos"] = 5000] = "Morelos";
    EstadoFirma[EstadoFirma["Nayarit"] = 5000] = "Nayarit";
    EstadoFirma[EstadoFirma["Nuevo Le\xf3n"] = 5000] = "Nuevo Le\xf3n";
    EstadoFirma[EstadoFirma["Oaxaca"] = 5000] = "Oaxaca";
    EstadoFirma[EstadoFirma["Puebla"] = 500] = "Puebla";
    EstadoFirma[EstadoFirma["Quer\xe9taro"] = 5000] = "Quer\xe9taro";
    EstadoFirma[EstadoFirma["Quintana Roo"] = 5000] = "Quintana Roo";
    EstadoFirma[EstadoFirma["San Luis Potos\xed"] = 5000] = "San Luis Potos\xed";
    EstadoFirma[EstadoFirma["Sinaloa"] = 5000] = "Sinaloa";
    EstadoFirma[EstadoFirma["Sonora"] = 5000] = "Sonora";
    EstadoFirma[EstadoFirma["Tabasco"] = 5000] = "Tabasco";
    EstadoFirma[EstadoFirma["Tamaulipas"] = 5000] = "Tamaulipas";
    EstadoFirma[EstadoFirma["Tlaxcala"] = 5000] = "Tlaxcala";
    EstadoFirma[EstadoFirma["Veracruz de Ignacio de la Llave"] = 5000] = "Veracruz de Ignacio de la Llave";
    EstadoFirma[EstadoFirma["Yucat\xe1n"] = 5000] = "Yucat\xe1n";
    EstadoFirma[EstadoFirma["Zacatecas"] = 5000] = "Zacatecas";
})($f0d540db358c20b7$export$4d1c8da1ae941898 || ($f0d540db358c20b7$export$4d1c8da1ae941898 = {}));
var $f0d540db358c20b7$export$8250b6f35bc15c68;
(function(NivelCobertura) {
    NivelCobertura["lite"] = "Lite";
    NivelCobertura["alpha"] = "Alpha";
    NivelCobertura["alphaPlus"] = "Alpha Plus";
})($f0d540db358c20b7$export$8250b6f35bc15c68 || ($f0d540db358c20b7$export$8250b6f35bc15c68 = {}));
var $f0d540db358c20b7$export$6e7b439551acada7;
(function(Coberturas) {
    Coberturas["investigacionRpp"] = "Investigacion RPP";
    Coberturas["seguro"] = "Seguro";
    Coberturas["firmaDeContrato"] = "Firma de Contrat";
    Coberturas["investigacionRG"] = "Investigaci\xf3n RG";
    Coberturas["gestionExtrajudicial"] = "Gestion Extrajudicial";
    Coberturas["recuperacionInmueble"] = "Recuperacion de Inmueble";
    Coberturas["recuperacionDeAdeudos"] = "Recuperacion de Adeudos";
})($f0d540db358c20b7$export$6e7b439551acada7 || ($f0d540db358c20b7$export$6e7b439551acada7 = {}));
// TO DO: Bu
const $f0d540db358c20b7$var$permitedCities = [
    "Canc\xfan",
    "Ciudad de M\xe9xico",
    "Cuernavaca",
    "Guadalajara",
    "Zapopan",
    "Tonal\xe1",
    "Tlajomulco de Z\xfa\xf1iga",
    "El Salto",
    "Ixtlahuac\xe1n de los Membrillos",
    "Juanacatl\xe1n",
    "Zapotlanejo",
    "Acatl\xe1n de Ju\xe1rez",
    "Tlaquepaque",
    "M\xe9rida",
    "Monterrey",
    "San Nicol\xe1s de los Garza",
    "Ciudad Apodaca",
    "Garc\xeda",
    "Ciudad General Escobedo",
    "Guadalupe",
    "Ciudad Santa Catarina",
    "San Pedro Garza Garc\xeda",
    "Pachuca de Soto",
    "Heroica Puebla de Zaragoza",
    "Santiago de Quer\xe9taro"
];
class $f0d540db358c20b7$export$3bbcb4831e58d00d {
    constructor(renta, cp, estadoFirma, nivelCobertura){
        this.renta = renta;
        this.resolved = new Promise(async (resolve)=>{
            const cpData = await this.getCpData(cp);
            const permitido = $f0d540db358c20b7$var$permitedCities.find((city)=>city === cpData.ciudad);
            if (!permitido) {
                const edomex = cpData.estado === "M\xe9xico";
                if (!edomex) {
                    console.log("No se encontr\xf3 la ciudad");
                    throw new Error("No se encontr\xf3 la ciudad");
                }
            }
            this.estadoGarantia = $f0d540db358c20b7$export$f566b60ae4e8e0b3[cpData.estado] ? $f0d540db358c20b7$export$f566b60ae4e8e0b3[cpData.estado] : $f0d540db358c20b7$export$f566b60ae4e8e0b3["Ciudad de M\xe9xico"];
            this.estadoFirma = estadoFirma ? estadoFirma : $f0d540db358c20b7$export$4d1c8da1ae941898["Ciudad de M\xe9xico"];
            //TO DO: traer variables de fuente externa
            this._investigacionRg = 21;
            this._perfilRiesgoIncumplimiento = 0.2;
            this._perfilRiesgoJuicioRecuperacion = 0.025;
            this._perfilRiesgoJuicioAdeudos = 0.025;
            //TO DO: traer constantes de fuente externa
            this._factorInvestigacion = 1;
            this._factorSeguro = 0.1308;
            this._factorFirma = 1;
            this._factorSolvencia = 1;
            this._factorIncumplimiento = 180;
            this._factorRecuperacion = 3718.88;
            this._factorAdeudos = 14875.51;
            //TO DO: traer niveles de fuente externa
            this._niveles = [
                {
                    nombre: $f0d540db358c20b7$export$8250b6f35bc15c68.alpha,
                    coberturas: [
                        $f0d540db358c20b7$export$6e7b439551acada7.investigacionRpp,
                        $f0d540db358c20b7$export$6e7b439551acada7.firmaDeContrato,
                        $f0d540db358c20b7$export$6e7b439551acada7.investigacionRG,
                        $f0d540db358c20b7$export$6e7b439551acada7.gestionExtrajudicial,
                        $f0d540db358c20b7$export$6e7b439551acada7.recuperacionInmueble,
                        $f0d540db358c20b7$export$6e7b439551acada7.recuperacionDeAdeudos
                    ]
                },
                {
                    nombre: $f0d540db358c20b7$export$8250b6f35bc15c68.alphaPlus,
                    coberturas: [
                        $f0d540db358c20b7$export$6e7b439551acada7.investigacionRpp,
                        $f0d540db358c20b7$export$6e7b439551acada7.firmaDeContrato,
                        $f0d540db358c20b7$export$6e7b439551acada7.investigacionRG,
                        $f0d540db358c20b7$export$6e7b439551acada7.gestionExtrajudicial,
                        $f0d540db358c20b7$export$6e7b439551acada7.recuperacionInmueble,
                        $f0d540db358c20b7$export$6e7b439551acada7.recuperacionDeAdeudos,
                        $f0d540db358c20b7$export$6e7b439551acada7.seguro
                    ]
                },
                {
                    nombre: $f0d540db358c20b7$export$8250b6f35bc15c68.lite,
                    coberturas: [
                        $f0d540db358c20b7$export$6e7b439551acada7.investigacionRG,
                        $f0d540db358c20b7$export$6e7b439551acada7.gestionExtrajudicial,
                        $f0d540db358c20b7$export$6e7b439551acada7.recuperacionInmueble
                    ]
                }
            ];
            this.nivelCobertura = this._niveles.find((niv)=>niv.nombre === nivelCobertura) ? this._niveles.find((niv)=>niv.nombre === nivelCobertura) : this._niveles[0];
            // axios("https://www.lycklig.com.mx/products/platos-rosa-con-dorado.json")
            //   .then((data) => console.log(data.data))
            //   .catch((err) => console.log(err));
            //setear a 0 costos
            this.costoInvestigacion = 0;
            this.costoSeguro = 0;
            this.costoFirma = 0;
            this.costoInvestigacionRg = 0;
            this.costoIncumplimiento = 0;
            this.costoRecuperacion = 0;
            this.costoAdeudos = 0;
            //setear a 0 cotización
            this._costoDeVentas = 0;
            this._utilidad = 0;
            this.precioDeVentas = 0;
            this.precioDeVentasMasIVA = 0;
            this._comisionInmobiliaria = 0;
            this.calcularCostos();
            this.cotizar();
            console.log("Terminando");
            resolve();
        });
    }
    async getCpData(cp) {
        const ciudad = await (0, $d0169d43d1e21383$export$2e2bcd8739ae039)(`https://acromatico-cp.uc.r.appspot.com/api/cp/${cp}`, {
            headers: {
                "X-Acromatico-JWT-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2wiOiJBZG1pbiIsImlkIjoiMTIzNDU2In0.lU5p4VREH8qVitzPaNmteGGmtpJA8PwiSNrHkhhJC1o"
            }
        });
        const ciudadData = await ciudad.json();
        return ciudadData;
    }
    calculoUtilidad(renta) {
        let resultado;
        if (renta <= 7000) resultado = 0.0428826023 * renta + 2412;
        else if (renta <= 8205.162) resultado = -0.0128826023 * renta + 2762;
        else if (renta <= 90000) resultado = 0.3295 * renta;
        else resultado = 0.23308 * renta + 8684;
        if (renta <= 7000) resultado += 350;
        else if (renta <= 40000) resultado += 0.05 * renta;
        else resultado += 2000;
        resultado = resultado - 821.86;
        return resultado;
    }
    calcularCostos() {
        this.costoInvestigacion = this.nivelCobertura?.coberturas.find((cober)=>cober === $f0d540db358c20b7$export$6e7b439551acada7.investigacionRpp) ? this._factorInvestigacion * this.estadoGarantia : 0;
        this.costoSeguro = this.nivelCobertura?.coberturas.find((cober)=>cober === $f0d540db358c20b7$export$6e7b439551acada7.seguro) ? this._factorSeguro * this.renta : 0;
        this.costoFirma = this.nivelCobertura?.coberturas.find((cober)=>cober === $f0d540db358c20b7$export$6e7b439551acada7.firmaDeContrato) ? this._factorFirma * this.estadoFirma : 0;
        this.costoInvestigacionRg = this.nivelCobertura?.coberturas.find((cober)=>cober === $f0d540db358c20b7$export$6e7b439551acada7.investigacionRG) ? this._factorSolvencia * this._investigacionRg : 0;
        this.costoIncumplimiento = this.nivelCobertura?.coberturas.find((cober)=>cober === $f0d540db358c20b7$export$6e7b439551acada7.gestionExtrajudicial) ? this._factorIncumplimiento * this._perfilRiesgoIncumplimiento : 0;
        this.costoRecuperacion = this.nivelCobertura?.coberturas.find((cober)=>cober === $f0d540db358c20b7$export$6e7b439551acada7.recuperacionInmueble) ? this._factorRecuperacion * this._perfilRiesgoJuicioRecuperacion : 0;
        this.costoAdeudos = this.nivelCobertura?.coberturas.find((cober)=>cober === $f0d540db358c20b7$export$6e7b439551acada7.recuperacionDeAdeudos) ? this._factorAdeudos * this._perfilRiesgoJuicioAdeudos : 0;
    }
    cotizar() {
        this._costoDeVentas = this.costoInvestigacion + this.costoSeguro + this.costoFirma + this.costoInvestigacionRg + this.costoIncumplimiento + this.costoRecuperacion + this.costoAdeudos;
        this._utilidad = this.calculoUtilidad(this.renta);
        let precioVentasTemp = this._utilidad + this._costoDeVentas;
        // Minimo de precio de venta ed de $3500 ya con IVA
        if (precioVentasTemp * 1.16 < 3500) precioVentasTemp = 3500 / 1.16;
        this.precioDeVentas = Math.floor(precioVentasTemp * 100) / 100;
        this.precioDeVentasMasIVA = Math.floor(this.precioDeVentas * 1.16 * 100) / 100;
        this.precioDeVentasMasIVA = Math.ceil(this.precioDeVentasMasIVA / 10) * 10;
        this.precioDeVentas = Math.floor(this.precioDeVentasMasIVA / 1.16 * 100) / 100;
        this._comisionInmobiliaria = Math.floor(this.precioDeVentasMasIVA * 10) / 100;
        return this.precioDeVentasMasIVA;
    }
    cambiarRenta(renta) {
        this.renta = renta;
        this.calcularCostos();
        return this.cotizar();
    }
    cambiarEstadoGarantia(estado) {
        this.estadoGarantia = estado;
        this.calcularCostos();
        return this.cotizar();
    }
    cambiarEstadoFirma(estado) {
        this.estadoFirma = estado;
        this.calcularCostos();
        return this.cotizar();
    }
    cambiarNivel(nivel) {
        this.nivelCobertura = this._niveles.find((niv)=>niv.nombre === nivel) ? this._niveles.find((niv)=>niv.nombre === nivel) : this._niveles[0];
        this.calcularCostos();
        return this.cotizar();
    }
}


export {$f0d540db358c20b7$export$f566b60ae4e8e0b3 as EstadoEnGarantia, $f0d540db358c20b7$export$4d1c8da1ae941898 as EstadoFirma, $f0d540db358c20b7$export$8250b6f35bc15c68 as NivelCobertura, $f0d540db358c20b7$export$6e7b439551acada7 as Coberturas, $f0d540db358c20b7$export$3bbcb4831e58d00d as Cotizador};
//# sourceMappingURL=index.js.map
