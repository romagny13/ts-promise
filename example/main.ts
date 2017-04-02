import { TSPromise } from '../src/promise';
import { TimeWatch } from './timewatch';

let timeWatch = new TimeWatch(true);
timeWatch.start();

let p1 = new TSPromise((resolve, reject) => {
    setTimeout(function () {
        resolve('P1 resolved!');
    }, 3000);
});
let p2 = new TSPromise((resolve, reject) => {
    setTimeout(function () {
        resolve('P2 resolved!');
    }, 3000);
});
let p3 = new TSPromise((resolve, reject) => {
    setTimeout(function () {
        resolve('P3 resolved!');
    }, 3000);
});
let p4 = new TSPromise((resolve, reject) => {
    setTimeout(function () {
        resolve('P resolved!');
    }, 3000);
});
let p5 = new TSPromise((resolve, reject) => {
    setTimeout(function () {
        resolve('P5 resolved!');
    }, 3000);
});

// all in parallel => 3s
TSPromise.all([p1, p2, p3, p4, p5]).then((result) => {
    console.log(result);
    timeWatch.end();
});


/*

let p1 = new TSPromise((resolve, reject) => {
    setTimeout(function () {
        resolve('P1 resolved!');
    }, 3000);
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
});*/
