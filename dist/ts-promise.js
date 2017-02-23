/*!
 * TSPromise v1.0.2
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

var SpecializedStackItemType;
(function (SpecializedStackItemType) {
    SpecializedStackItemType[SpecializedStackItemType["onResolved"] = 0] = "onResolved";
    SpecializedStackItemType[SpecializedStackItemType["onRejected"] = 1] = "onRejected";
})(SpecializedStackItemType || (SpecializedStackItemType = {}));
var SpecializedStackItem = (function () {
    function SpecializedStackItem(type, fn) {
        this.type = type;
        this.fn = fn;
    }
    return SpecializedStackItem;
}());
var SpecializedStack = (function () {
    function SpecializedStack() {
        this._stack = [];
    }
    SpecializedStack.prototype._getNextItemIndex = function (type) {
        var length = this._stack.length;
        for (var i = 0; i < length; i++) {
            var item = this._stack[i];
            if (item.type === type) {
                return i;
            }
        }
        return -1;
    };
    SpecializedStack.prototype._splice = function (index) {
        this._stack.splice(0, index);
    };
    SpecializedStack.prototype.clear = function () {
        this._stack = [];
    };
    SpecializedStack.prototype.push = function (type, fn) {
        this._stack.push(new SpecializedStackItem(type, fn));
    };
    SpecializedStack.prototype.next = function (type) {
        var index = this._getNextItemIndex(type);
        if (index !== -1) {
            this._splice(index);
        }
        else {
            this.clear();
        }
        return this._stack.shift();
    };
    return SpecializedStack;
}());

var PromiseResultState;
(function (PromiseResultState) {
    PromiseResultState[PromiseResultState["completed"] = 0] = "completed";
    PromiseResultState[PromiseResultState["waitOnResolvedCallback"] = 1] = "waitOnResolvedCallback";
    PromiseResultState[PromiseResultState["waitOnRejectedCallback"] = 2] = "waitOnRejectedCallback";
})(PromiseResultState || (PromiseResultState = {}));
function resolve(root, result) {
    root._result = result;
    var item = root._stack.next(SpecializedStackItemType.onResolved);
    if (item) {
        item.fn();
    }
    else {
        root._state = PromiseResultState.waitOnResolvedCallback;
    }
}
function reject(root, reason) {
    root._reason = reason;
    var item = root._stack.next(SpecializedStackItemType.onRejected);
    if (item) {
        item.fn();
    }
    else {
        root._state = PromiseResultState.waitOnRejectedCallback;
    }
}
function then(root, promise, onComplete, onRejection) {
    var hasComplete = isFunction(onComplete), hasRejection = isFunction(onRejection);
    promise._child = new TSChildPromise(root);
    function _doCompletion() {
        try {
            var returnValue = onComplete(root._result);
            promise._child.resolve(returnValue);
        }
        catch (error) {
            promise._child.reject(error);
        }
    }
    function _doRejection() {
        try {
            var returnValue = onRejection(root._reason);
            promise._child.resolve(returnValue);
        }
        catch (error) {
            promise._child.reject(error);
        }
    }
    if (hasComplete) {
        root._stack.push(SpecializedStackItemType.onResolved, function () {
            _doCompletion();
        });
    }
    if (hasRejection) {
        root._stack.push(SpecializedStackItemType.onRejected, function () {
            _doRejection();
        });
    }
    if (hasComplete && root._state === PromiseResultState.waitOnResolvedCallback) {
        var item = root._stack.next(SpecializedStackItemType.onResolved);
        if (item) {
            item.fn();
        }
    }
    else if (hasRejection && root._state === PromiseResultState.waitOnRejectedCallback) {
        var item = root._stack.next(SpecializedStackItemType.onRejected);
        if (item) {
            item.fn();
        }
    }
    return promise._child;
}
var TSPromiseBase = (function () {
    function TSPromiseBase() {
    }
    return TSPromiseBase;
}());
var TSPromise$1 = (function (_super) {
    __extends(TSPromise, _super);
    function TSPromise(executor) {
        var _this = _super.call(this) || this;
        _this._stack = new SpecializedStack();
        try {
            if (isFunction(executor)) {
                executor(function (result) {
                    _this.resolve(result);
                }, function (reason) {
                    _this.reject(reason);
                });
            }
        }
        catch (error) {
            _this.reject(error);
        }
        return _this;
    }
    TSPromise.prototype.resolve = function (result) {
        resolve(this, result);
    };
    TSPromise.prototype.reject = function (reason) {
        reject(this, reason);
    };
    TSPromise.prototype.then = function (onComplete, onRejection) {
        return then(this, this, onComplete, onRejection);
    };
    TSPromise.prototype.catch = function (onRejection) {
        return then(this, this, null, onRejection);
    };
    TSPromise.all = function (promises) {
        var results = [], isCompleted = false, length = promises.length, index = 0;
        var promiseAll = new TSPromise();
        for (var i = 0; i < length; i++) {
            var promise = promises[i];
            try {
                promise.then(function (result) {
                    if (!isCompleted) {
                        results.push(result);
                        index++;
                        if (index === length) {
                            isCompleted = true;
                            promiseAll.resolve(results);
                        }
                    }
                }, function (reason) {
                    if (!isCompleted) {
                        isCompleted = true;
                        promiseAll.reject(reason);
                    }
                });
            }
            catch (error) {
                isCompleted = true;
                promiseAll.reject(error);
            }
        }
        return promiseAll;
    };
    TSPromise.race = function (promises) {
        var isCompleted = false, length = promises.length, index = 0;
        var promiseRace = new TSPromise();
        for (var i = 0; i < length; i++) {
            var promise = promises[i];
            try {
                promise.then(function (result) {
                    if (!isCompleted) {
                        isCompleted = true;
                        promiseRace.resolve(result);
                    }
                }, function (reason) {
                    if (!isCompleted) {
                        isCompleted = true;
                        promiseRace.reject(reason);
                    }
                });
            }
            catch (error) {
                isCompleted = true;
                promiseRace.reject(error);
            }
        }
        return promiseRace;
    };
    return TSPromise;
}(TSPromiseBase));
var TSChildPromise = (function (_super) {
    __extends(TSChildPromise, _super);
    function TSChildPromise(root) {
        var _this = _super.call(this) || this;
        _this._root = root;
        return _this;
    }
    TSChildPromise.prototype.resolve = function (result) {
        resolve(this._root, result);
    };
    TSChildPromise.prototype.reject = function (reason) {
        reject(this._root, reason);
    };
    TSChildPromise.prototype.then = function (onComplete, onRejection) {
        return then(this._root, this, onComplete, onRejection);
    };
    TSChildPromise.prototype.catch = function (onRejection) {
        return then(this._root, this, null, onRejection);
    };
    return TSChildPromise;
}(TSPromiseBase));

return TSPromise$1;

})));
