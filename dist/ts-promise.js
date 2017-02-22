/*!
 * TSPromise v1.0.0
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

var PromiseResultState;
(function (PromiseResultState) {
    PromiseResultState[PromiseResultState["completed"] = 0] = "completed";
    PromiseResultState[PromiseResultState["waitOnResolvedCallback"] = 1] = "waitOnResolvedCallback";
    PromiseResultState[PromiseResultState["waitOnRejectedCallback"] = 2] = "waitOnRejectedCallback";
})(PromiseResultState || (PromiseResultState = {}));
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
var TSPromise$1 = (function () {
    function TSPromise(executor) {
        var _this = this;
        this._root = this;
        this._stack = new SpecializedStack();
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
            this.reject(error);
        }
    }
    TSPromise.prototype.resolve = function (result) {
        this._root._result = result;
        var item = this._root._stack.next(SpecializedStackItemType.onResolved);
        if (item) {
            item.fn();
        }
        else {
            this._root._state = PromiseResultState.waitOnResolvedCallback;
        }
    };
    TSPromise.prototype.reject = function (reason) {
        this._root._reason = reason;
        var item = this._root._stack.next(SpecializedStackItemType.onRejected);
        if (item) {
            item.fn();
        }
        else {
            this._root._state = PromiseResultState.waitOnRejectedCallback;
        }
    };
    TSPromise.prototype.then = function (onComplete, onRejection) {
        this._child = new TSChildPromise(this._root);
        var self = this;
        function _doCompletion() {
            try {
                var returnValue = onComplete(self._root._result);
                self._child.resolve(returnValue);
            }
            catch (error) {
                self._child.reject(error);
            }
        }
        function _doRejection() {
            try {
                var returnValue = onRejection(self._root._reason);
                self._child.resolve(returnValue);
            }
            catch (error) {
                self._child.reject(error);
            }
        }
        if (isFunction(onComplete)) {
            this._root._stack.push(SpecializedStackItemType.onResolved, function () {
                _doCompletion();
            });
        }
        if (isFunction(onRejection)) {
            this._root._stack.push(SpecializedStackItemType.onRejected, function () {
                _doRejection();
            });
        }
        if (isFunction(onComplete) && this._root._state === PromiseResultState.waitOnResolvedCallback) {
            var item = this._root._stack.next(SpecializedStackItemType.onResolved);
            if (item) {
                item.fn();
            }
        }
        else if (onRejection && this._root._state === PromiseResultState.waitOnRejectedCallback) {
            var item = this._root._stack.next(SpecializedStackItemType.onRejected);
            if (item) {
                item.fn();
            }
        }
        return this._child;
    };
    TSPromise.prototype.catch = function (onRejection) {
        return this.then(null, onRejection);
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
        var promiseAll = new TSPromise();
        for (var i = 0; i < length; i++) {
            var promise = promises[i];
            try {
                promise.then(function (result) {
                    if (!isCompleted) {
                        isCompleted = true;
                        promiseAll.resolve(result);
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
    return TSPromise;
}());
var TSChildPromise = (function (_super) {
    __extends(TSChildPromise, _super);
    function TSChildPromise(root) {
        var _this = _super.call(this) || this;
        _this._root = root;
        return _this;
    }
    return TSChildPromise;
}(TSPromise$1));

return TSPromise$1;

})));
