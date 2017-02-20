/*!
 * TSPromise v0.0.3
 * (c) 2017 romagny13
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.TSPromise = factory());
}(this, (function () { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function isFunction(value) { return typeof value === 'function'; }
var IdGen = (function () {
    function IdGen() {
        this._cache = {};
    }
    IdGen.prototype._generateKey = function () {
        return '__p_' + Math.random().toString(36).substr(2, 9);
    };
    IdGen.prototype._retrieve = function (key) {
        if (this._cache.hasOwnProperty(key)) {
            return this._cache[key];
        }
    };
    IdGen.prototype.getNewId = function () {
        var key = this._generateKey();
        var id = key + '.0';
        this._cache[key] = [id];
        return id;
    };
    IdGen.prototype.getId = function (id) {
        if (typeof id === 'string') {
            var key = id.split('.')[0];
            var cached = this._retrieve(key);
            if (cached) {
                var newId = key + '.' + cached.length;
                this._cache[key].push(newId);
                return newId;
            }
        }
        return this.getNewId();
    };
    return IdGen;
}());
var idGen = new IdGen();

var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["done"] = 0] = "done";
    PromiseState[PromiseState["fail"] = 1] = "fail";
    PromiseState[PromiseState["waitResult"] = 2] = "waitResult";
    PromiseState[PromiseState["waitSuccessCallBack"] = 3] = "waitSuccessCallBack";
    PromiseState[PromiseState["waitErrorCallBack"] = 4] = "waitErrorCallBack";
    PromiseState[PromiseState["none"] = 5] = "none";
})(PromiseState || (PromiseState = {}));
var PromiseMode;
(function (PromiseMode) {
    PromiseMode[PromiseMode["all"] = 0] = "all";
    PromiseMode[PromiseMode["race"] = 1] = "race";
})(PromiseMode || (PromiseMode = {}));
var PromiseBase = (function () {
    function PromiseBase() {
    }
    PromiseBase.prototype._setPending = function (state, pending) {
        this._state = state;
        this._pending = pending;
    };
    PromiseBase.prototype._handleSuccess = function (result) {
        var subResult;
        try {
            this._isCompleted = true;
            subResult = this.onSuccess(result);
            this._state = PromiseState.done;
            // chaining
            this._proxy.resolve(subResult);
        }
        catch (e) {
            this._handleException(e);
        }
    };
    PromiseBase.prototype._handleError = function (reason) {
        var subResult;
        try {
            this._isCompleted = true;
            subResult = this.onError(reason);
            this._state = PromiseState.fail;
            this._proxy.resolve(subResult);
        }
        catch (e) {
            this._handleException(e);
        }
    };
    PromiseBase.prototype.resolve = function (result) {
        // success callback present ?
        if (this._state === PromiseState.waitResult) {
            this._handleSuccess(result);
        }
        else {
            // pending
            this._setPending(PromiseState.waitSuccessCallBack, result);
        }
    };
    PromiseBase.prototype.reject = function (reason) {
        if (this._state === PromiseState.waitResult) {
            // at first error
            this._handleError(reason);
        }
        else {
            this._setPending(PromiseState.waitErrorCallBack, reason);
        }
    };
    PromiseBase.prototype._handleException = function (error) {
        if (this._isCompleted) {
            this._proxy.reject(error);
        }
        else {
            this.reject(error);
        }
    };
    return PromiseBase;
}());

var TSPromiseArray = (function (_super) {
    __extends(TSPromiseArray, _super);
    function TSPromiseArray(promises, mode) {
        var _this = _super.call(this) || this;
        /*
            mode all
            promise with array of promises
            handle success if all promises are resolved
            - and if success callback present
            - else set state to wait success callback and pending
            handle error if one promise of array is rejected
            - and if error callback present
            - else set state to wait error callback and pending
            handle notify if notify callback present if set pending notify

            mode race
            handle success or error on first promise resolved / rejected
        */
        _this._id = idGen.getNewId();
        _this._isCompleted = false;
        _this._promiseResults = [];
        _this._pendingNotify = [];
        _this._mode = mode;
        _this._promises = promises;
        if (_this._mode === PromiseMode.all) {
            _this._iteratePromises(promises);
        }
        else if (_this._mode === PromiseMode.race) {
            _this._race(promises);
        }
        return _this;
    }
    TSPromiseArray.prototype._handleNotifyAll = function () {
        var _this = this;
        if (this._pendingNotify.length > 0) {
            this._pendingNotify.forEach(function (pendingResult) {
                _this.onNotify(pendingResult);
            });
            this._pendingNotify = [];
        }
    };
    TSPromiseArray.prototype._onNotify = function (result) {
        if (this.onNotify) {
            this.onNotify(result);
        }
        else {
            this._pendingNotify.push(result);
        }
    };
    TSPromiseArray.prototype._nextPromise = function (promise, promises, index, length) {
        var _this = this;
        promise.then(function (result) {
            _this._onNotify(result);
            if (result) {
                _this._promiseResults.push(result);
            }
            // push result to result array
            index++;
            if (index < length) {
                _this._nextPromise(promises[index], promises, index, length);
            }
            else {
                _this.resolve(_this._promiseResults);
            }
        }, function (reason) {
            _this.reject(reason);
        });
    };
    TSPromiseArray.prototype._iteratePromises = function (promises) {
        var length = promises.length, index = 0;
        if (length > 0) {
            this._nextPromise(promises[0], promises, index, length);
        }
        else {
            this.resolve([]);
        }
    };
    TSPromiseArray.prototype._race = function (promises) {
        var _this = this;
        promises.forEach(function (promise) {
            promise.then(function (result) {
                if (!_this._isCompleted) {
                    if (result) {
                        _this._promiseResults.push(result);
                    }
                    _this.resolve(result);
                }
            }, function (reason) {
                _this.reject(reason);
            });
        });
    };
    TSPromiseArray.prototype.then = function (onSuccess, onError, onNotify) {
        this._proxy = new TSPromise$1(null, this._id);
        this._proxy._parent = this;
        this.onSuccess = onSuccess;
        this.onError = onError;
        this.onNotify = onNotify;
        // pending notify ?
        if (isFunction(this.onNotify)) {
            this._handleNotifyAll();
        }
        if (this._state === PromiseState.waitSuccessCallBack) {
            this._handleSuccess(this._promiseResults);
        }
        else if (this._state === PromiseState.waitErrorCallBack) {
            if (isFunction(this.onError)) {
                this._handleError(this._pending);
            }
        }
        else {
            this._state = PromiseState.waitResult;
        }
        return this._proxy;
    };
    TSPromiseArray.prototype.catch = function (onError) {
        return this.then(this.onSuccess, onError, this.onNotify);
    };
    return TSPromiseArray;
}(PromiseBase));

var TSPromise$1 = (function (_super) {
    __extends(TSPromise, _super);
    function TSPromise(fn, id) {
        var _this = _super.call(this) || this;
        if (!id) {
            _this._id = idGen.getNewId();
        }
        else {
            _this._id = idGen.getId(id);
        }
        try {
            if (isFunction(fn)) {
                fn(function (result) {
                    // resolve
                    _this.resolve(result);
                }, function (reason) {
                    // reject
                    _this.reject(reason);
                });
            }
        }
        catch (e) {
            _this._handleException(e);
        }
        return _this;
    }
    TSPromise.prototype.then = function (onSuccess, onError) {
        this._proxy = new TSPromise(null, this._id);
        this._proxy._parent = this;
        this.onSuccess = onSuccess;
        this.onError = onError;
        if (this._state === PromiseState.waitSuccessCallBack) {
            this._handleSuccess(this._pending);
        }
        else if (this._state === PromiseState.waitErrorCallBack) {
            if (this.onError) {
                this._handleError(this._pending);
            }
        }
        else {
            // wait for result
            this._state = PromiseState.waitResult;
        }
        return this._proxy;
    };
    TSPromise.prototype.catch = function (onError) {
        return this._parent.then(null, onError);
    };
    TSPromise.all = function (promises) {
        return new TSPromiseArray(promises, PromiseMode.all);
    };
    TSPromise.race = function (promises) {
        return new TSPromiseArray(promises, PromiseMode.race);
    };
    return TSPromise;
}(PromiseBase));

return TSPromise$1;

})));
