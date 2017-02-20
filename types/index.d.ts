// Type definitions for TSPromise 0.0.1
// Project: https://github.com/romagny13/ts-promise
// Definitions by: romagny13 <https://github.com/romagny13>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface PromiseBase {
    resolve(result?: any): void;
    reject(reason?: any): void;
}

interface TSPromiseArray extends PromiseBase {
    then(onSuccess: Function, onError?: Function, onNotify?: Function): TSPromiseStatic;
    catch(onError: Function): TSPromiseStatic;
}

interface TSPromiseStatic extends PromiseBase {
    new (fn?: Function): TSPromiseStatic;
    then(onSuccess: Function, onError?: Function): TSPromiseStatic;
    catch(onError: Function): TSPromiseStatic;
    all(promises: any[]): TSPromiseArray;
    race(promises: any[]): TSPromiseArray;
}

declare var TSPromise: TSPromiseStatic;

declare module 'romagny13-ts-promise' {
    export = TSPromise;
}
