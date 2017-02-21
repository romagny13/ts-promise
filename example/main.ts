import { TSPromise } from '../src/promise';

let p1 = new TSPromise((resolve, reject) => {
    resolve('P1 resolved!');
});

setTimeout(() => {
    p1.then((result) => {
        console.log(result);
    }, (reason) => {
        console.log('error', reason);
    });
});


let count = 0;
let p2 = new TSPromise((resolve, reject) => {
    resolve('p2 resolved');
});

p2.then((result) => {
    console.log('promise 1', 'count:', count, 'result:', result);
    count++;
    return count;
}, (reason) => {

}).then((result) => {
    console.log('promise 2', 'count:', count, 'result:', result);
    count++;
    return count;
}).then((result) => {
    console.log('promise 3', 'count:', count, 'result:', result);
    count++;
    return count;
}).then((result) => {
    console.log('promise 4', 'count:', count, 'result:', result);
});