function getCurrentTime() {
    return (new Date().getTime() / 1000 | 0);
}

function log(message) {
    console.log(message);
}

export class TimeWatch {
    _logMessage: boolean;
    _start: number;
    _end: number;
    result: number;
    constructor(logMessage?) {
        this._logMessage = typeof logMessage === 'boolean' ? logMessage : false;
    }

    start() {
        this._start = getCurrentTime();
    }

    end() {
        this._end = getCurrentTime();
        this.result = this._end - this._start;
        if (this._logMessage) {
            log('total:' + this.result + 's');
        }
        return this.result;
    }
}
