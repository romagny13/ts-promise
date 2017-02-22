// Type definitions for TSPromise 1.0.0
// Project: https://github.com/romagny13/ts-promise
// Definitions by: romagny13 <https://github.com/romagny13>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface TSPromiseStatic {
    new(executor?: Function):TSPromiseStatic;
    resolve(result?: any):void;
    reject(reason?: any):void;
    then(onComplete: Function, onRejection?: Function): TSChildPromise;
    catch(onRejection: Function): TSChildPromise;
    all(promises: TSPromiseStatic[]): TSPromiseStatic;
    race(promises: TSPromiseStatic[]): TSPromiseStatic;
}

interface TSChildPromise extends TSPromiseStatic {}

declare var TSPromise: TSPromiseStatic;

declare module 'romagny13-ts-promise' {
    export = TSPromise;
}
