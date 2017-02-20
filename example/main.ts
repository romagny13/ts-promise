import * as t from '../src/rollup';

let p1 = new t.TSPromise((resolve, reject) => {
    resolve('P1 resolved!');
});

setTimeout(() => {
    p1.then((result) => {
        console.log(result);
    }, (reason) => {
        console.log('error', reason);
    });
}, 500);