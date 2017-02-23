# TypeScript Promise

Light promise polyfill  easy to understand.

[![Build Status](https://travis-ci.org/romagny13/ts-promise.svg?branch=master)](https://travis-ci.org/romagny13/ts-promise)

```
npm i romagny13-ts-promise -S
```

Support (<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">documentation</a>):
- Promise
- all (parallel)
- race

## With TypeScript

```js
import * as TSPromise from 'romagny13-ts-promise';

let p1 = new TSPromise((resolve, reject) => {
    /* support :
       - resolve 
       - reject
       - throw exception
    */
    setTimeout(() => {
        resolve('P1 resolved');
    }, 500);
});

p1.then((result) => {
    /* support :
     - return value
     - throw exception
    */
}, (reason) => {
    /* support :
     - return value
     - throw exception
    */
});
```

Chaining and ignore useless callbacks (example with all)

```js
let p1 = new TSPromise((resolve, reject) => {
    resolve('p1 resolved');
});

let p2 = new TSPromise((resolve, reject) => {
    resolve('p2 resolved');
});

TSPromise.all([p1, p2]).then((result) => {
    return 'return value';
}).catch(() => { })
  .catch(() => { })
  .catch(() => { })
  .catch(() => { })
  .then((result) => {
      // ... result 'return value'
});
```
Or with an exception

```js
let p1 = new TSPromise((resolve, reject) => {
    resolve('p1 resolved');
});

let p2 = new TSPromise((resolve, reject) => {
    resolve('p2 resolved');
});

TSPromise.all([p1, p2]).then((result) => {
    throw 'my error';
}).catch((reason) => { 
    // ... reason 'my error'
});
```

## es5

```html
<script src="node_modules/romagny13-ts-promise/ts-promise.js"></script>
<script>
    var p1 = new TSPromise(function (resolve, reject) {
        resolve('P1 resolved');
    });

    setTimeout(function () {
        p1.then(function (result) {
            console.log('completed', result);
        }, function (reason) {
            console.log('error', reason);
        });
    }, 500);
</script>
```

## Polyfill for IE

```js
window.Promise = window.Promise || TSPromise;

var p1 = new Promise(function (resolve, reject) {
    resolve('P1 resolved with IE');
});

p1.then(function (result) {

}, function (reason) {
   
});
```
