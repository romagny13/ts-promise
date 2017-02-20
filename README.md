# TypeScript Promise

```
npm i romagny13-ts-promise -S
```

## Sample with TypeScript

```js
import * as TSPromise from 'romagny13-ts-promise';

let p1 = new TSPromise((resolve, reject) => {
    resolve('P1 resolved!');
});

setTimeout(() => {
    p1.then((result) => {
        console.log(result);
    }, (reason) => {
        console.log('error', reason);
    });
}, 500);
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
