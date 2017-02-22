# TypeScript Promise

Light promise polyfill  easy to understand.

[![Build Status](https://travis-ci.org/romagny13/ts-promise.svg?branch=master)](https://travis-ci.org/romagny13/ts-promise)

```
npm i romagny13-ts-promise -S
```

Support (<a href="https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise">documentation</a>):
- Promise
- all (parrallel)
- race

## Sample with TypeScript

```js
import * as TSPromise from 'romagny13-ts-promise';

let p1 = new TSPromise((resolve, reject) => {
    /* support :
       - resolve 
       - reject
       - throw exception
    */
    setTimeout(() => {
        resolve('P1 resolved!');
    }, 500);
});

p1.then((result) => {
    console.log(result);
}, (reason) => {
    console.log('error', reason);
});
```

Example: chaining and ignore useless callbacks 

```js
let p1 = new TSPromise((resolve, reject) => {
    resolve('p1 resolved');
});

let p2 = new TSPromise((resolve, reject) => {
    resolve('p2 resolved');
});

TSPromise.all([p1, p2]).then((result) => {
    /* support :
     - return value
     - throw exception
    */
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
        p1.then((result) => {
            console.log('completed', result);
        }, function (reason) {
            console.log('error', reason);
        });
    }, 500);
</script>
```
