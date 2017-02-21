/*!
 * TSPromise v0.0.5
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

function isDefined(value) { return typeof value !== 'undefined'; }
function isFunction(value) { return typeof value === 'function'; }
var IdGen = (function () {
    function IdGen() {
        this._cache = {};
        this._cacheSize = 100;
    }
    IdGen.prototype._generateKey = function () {
        return '__p_' + Math.random().toString(36).substr(2, 9);
    };
    IdGen.prototype._retrieve = function (key) {
        if (this._cache.hasOwnProperty(key)) {
            return this._cache[key];
        }
    };
    IdGen.prototype._checkCacheSize = function () {
        if (this._currentSize === this._cacheSize) {
            this.clear();
        }
    };
    IdGen.prototype.getNewId = function () {
        this._checkCacheSize();
        var key = this._generateKey();
        var id = key + '.0';
        this._cache[key] = [id];
        this._currentSize++;
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
    IdGen.prototype.clear = function () {
        this._cache = {};
        this._currentSize = 0;
    };
    return IdGen;
}());
var idGen = new IdGen();

var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["waitCompleteCallBack"] = 0] = "waitCompleteCallBack";
    PromiseState[PromiseState["waitRejectionCallBack"] = 1] = "waitRejectionCallBack";
    PromiseState[PromiseState["waitResolveOrReject"] = 2] = "waitResolveOrReject";
    PromiseState[PromiseState["completed"] = 3] = "completed";
    PromiseState[PromiseState["none"] = 4] = "none";
})(PromiseState || (PromiseState = {}));
var PromiseMode;
(function (PromiseMode) {
    PromiseMode[PromiseMode["all"] = 0] = "all";
    PromiseMode[PromiseMode["race"] = 1] = "race";
})(PromiseMode || (PromiseMode = {}));
function createChildPromise(parent, id) {
    var child = new TSPromise$1(null, id);
    child._parent = parent;
    return child;
}
var TSPromiseBase = (function () {
    function TSPromiseBase() {
    }
    TSPromiseBase.prototype._doComplete = function (result) {
        try {
            this._pending = undefined;
            this._state = PromiseState.completed;
            var returnValue = this._onComplete(result); // simple function
            // chaining
            this._child.resolve(returnValue);
        }
        catch (error) {
            this._child.reject(error);
        }
    };
    TSPromiseBase.prototype._doRejection = function (reason) {
        try {
            this._pending = undefined;
            this._state = PromiseState.completed;
            var returnValue = this._onReject(reason);
            // chaining
            this._child.resolve(returnValue);
        }
        catch (error) {
            // handle child
            this._child.reject(error);
        }
    };
    TSPromiseBase.prototype._setPending = function (state, pending) {
        this._state = state;
        this._pending = pending;
    };
    TSPromiseBase.prototype.resolve = function (result) {
        // resolved
        if (this._onComplete) {
            this._doComplete(result);
        }
        else {
            // pending complete callback
            this._setPending(PromiseState.waitCompleteCallBack, result);
        }
    };
    TSPromiseBase.prototype.reject = function (reason) {
        // rejected
        if (this._onReject) {
            this._doRejection(reason);
        }
        else {
            // pending rejection callback
            this._setPending(PromiseState.waitRejectionCallBack, reason);
        }
    };
    return TSPromiseBase;
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
    TSPromiseArray.prototype._notifyPendings = function () {
        var _this = this;
        if (this._pendingNotify.length > 0) {
            this._pendingNotify.forEach(function (pendingResult) {
                _this._onNotify(pendingResult);
            });
            this._pendingNotify = [];
        }
    };
    TSPromiseArray.prototype._doNotification = function (result) {
        if (this._onNotify) {
            this._onNotify(result);
        }
        else {
            this._pendingNotify.push(result);
        }
    };
    TSPromiseArray.prototype._nextPromise = function (promise, promises, index, length) {
        var _this = this;
        promise.then(function (result) {
            _this._doNotification(result);
            if (isDefined(result)) {
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
                if (_this._state !== PromiseState.completed) {
                    if (isDefined(result)) {
                        _this._promiseResults.push(result);
                    }
                    _this.resolve(result);
                }
            }, function (reason) {
                _this.reject(reason);
            });
        });
    };
    TSPromiseArray.prototype.then = function (onComplete, onReject, onNotify) {
        this._child = createChildPromise(this, this._id);
        this._onComplete = onComplete;
        this._onReject = onReject;
        this._onNotify = onNotify;
        // pending notify ?
        if (isFunction(this._onNotify)) {
            this._notifyPendings();
        }
        if (this._state === PromiseState.waitCompleteCallBack) {
            this._doComplete(this._promiseResults);
        }
        else if (this._state === PromiseState.waitRejectionCallBack) {
            if (isFunction(this._onReject)) {
                this._doRejection(this._pending);
            }
        }
        else {
            this._state = PromiseState.waitResolveOrReject;
        }
        return this._child;
    };
    TSPromiseArray.prototype.catch = function (onError) {
        return this.then(this._onComplete, onError, this._onNotify);
    };
    return TSPromiseArray;
}(TSPromiseBase));

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
        if (isFunction(fn)) {
            try {
                fn(function (result) {
                    // resolved
                    _this.resolve(result);
                }, function (reason) {
                    // rejected
                    _this.reject(reason);
                });
            }
            catch (error) {
                _this.reject(error);
            }
        }
        return _this;
    }
    TSPromise.prototype.then = function (onComplete, onReject) {
        this._child = createChildPromise(this, this._id);
        this._onComplete = onComplete;
        this._onReject = onReject;
        if (this._state === PromiseState.waitCompleteCallBack) {
            this._doComplete(this._pending);
        }
        else if (this._state === PromiseState.waitRejectionCallBack) {
            if (isFunction(this._onReject)) {
                this._doRejection(this._pending);
            }
        }
        else {
            this._state = PromiseState.waitResolveOrReject;
        }
        return this._child;
    };
    TSPromise.prototype.catch = function (onReject) {
        // parent is root ?
        if (this._parent._state === PromiseState.completed) {
            return this.then(this._onComplete, onReject);
        }
        else {
            return this._parent.then(this._onComplete, onReject);
        }
    };
    TSPromise.all = function (promises) {
        return new TSPromiseArray(promises, PromiseMode.all);
    };
    TSPromise.race = function (promises) {
        return new TSPromiseArray(promises, PromiseMode.race);
    };
    return TSPromise;
}(TSPromiseBase));

return TSPromise$1;

})));
