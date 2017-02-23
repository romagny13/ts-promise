import { TSPromise } from '../src/promise';

function TimeWatch(log) {
    var self = this;
    this.log = typeof log === 'boolean' ? log : false;
    function getCurrentTime() {
        return (new Date().getTime() / 1000 | 0);
    }

    function showLog(message) {
        if (self.log) {
            console.log(message);
        }
    }

    this.start = function () {
        self.startTime = getCurrentTime();
    };
    this.end = function () {
        self.endTime = getCurrentTime();
        self.result = self.endTime - self.startTime;
        showLog("total:" + self.result + "s");
        return self.result;
    };
}

let t = new TimeWatch(true);
t.start();

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


TSPromise.all([p1, p2, p3, p4, p5]).then((result) => {
    console.log(result);
    t.end();
});

/*setTimeout(() => {
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