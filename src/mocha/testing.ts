/**
 * testing utilities for mocha
 * Original: https://github.com/angular/angular/blob/2.0.0-beta.16/modules/angular2/src/testing/testing_internal.ts
 */

import {provide} from "angular2/core";
import {global, isFunction, isPromise} from "angular2/src/facade/lang";

import {getTestInjector, FunctionWithParamTokens} from "../core/test_injector";

const _global = <any>(typeof window === "undefined" ? global : window);

export type SyncTestFn = () => void|Promise<any>;
type AsyncTestFn = (done: MochaDone) => void;
type AnyTestFn = SyncTestFn | AsyncTestFn;

/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export class AsyncTestCompleter {
    constructor(private _done: Function) {
    }

    done(error?: any): void {
        this._done(error);
    }
}

const mochaBeforeEach: (action: () => void) => void = _global.beforeEach;
const mochaDescribe: Mocha.IContextDefinition = _global.describe;
const mochaXDescribe: Mocha.IContextDefinition = _global.xdescribe;
const mochaIt: Mocha.ITestDefinition = _global.it;
const mochaXIt: Mocha.ITestDefinition = _global.xit;

const runnerStack: any[] = [];
let inIt = false;

const testInjector = getTestInjector();

/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 */
class BeforeEachRunner {
    private _fns: Array<FunctionWithParamTokens | SyncTestFn> = [];

    constructor(private _parent: BeforeEachRunner) {
    }

    beforeEach(fn: FunctionWithParamTokens | SyncTestFn): void {
        this._fns.push(fn);
    }

    run(): void {
        if (this._parent) this._parent.run();
        this._fns.forEach((fn) => {
            return isFunction(fn) ? (<SyncTestFn>fn)() :
                (testInjector.execute(<FunctionWithParamTokens>fn));
        });
    }
}

// Reset the test providers before each test
mochaBeforeEach(() => {
    testInjector.reset();
});

function _describe(mochaFn: Function, ...args: any[]) {
    const parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
    const runner = new BeforeEachRunner(parentRunner);
    runnerStack.push(runner);
    const suite = mochaFn(...args);
    runnerStack.pop();
    return suite;
}

export function describe(...args: any[]): void {
    return _describe(mochaDescribe, ...args);
}

export function xdescribe(...args: any[]): void {
    return _describe(mochaXDescribe, ...args);
}

export function beforeEach(fn: FunctionWithParamTokens | SyncTestFn): void {
    if (runnerStack.length > 0) {
        // Inside a describe block, beforeEach() uses a BeforeEachRunner
        runnerStack[runnerStack.length - 1].beforeEach(fn);
    } else {
        // Top level beforeEach() are delegated to jasmine
        mochaBeforeEach(<SyncTestFn>fn);
    }
}

/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     provide(Compiler, {useClass: MockCompiler}),
 *     provide(SomeToken, {useValue: myValue}),
 *   ]);
 */
export function beforeEachProviders(fn: () => any[]): void {
    mochaBeforeEach(() => {
        var providers = fn();
        if (!providers) return;
        testInjector.addProviders(providers);
    });
}

function _it(mochaFn: Function, name: string, testFn: FunctionWithParamTokens | AnyTestFn): void {
    const runner = runnerStack[runnerStack.length - 1];

    if (testFn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `it('test', inject([AsyncTestCompleter], (async) => { ...
        // }));`
        let testFnT = testFn;

        if (testFn.hasToken(AsyncTestCompleter)) {
            mochaFn(name, (done: MochaDone) => {
                let completerProvider = provide(AsyncTestCompleter, {
                    useFactory: () => {
                        // Mark the test as async when an AsyncTestCompleter is injected in an it()
                        if (!inIt) throw new Error('AsyncTestCompleter can only be injected in an "it()"');
                        return new AsyncTestCompleter(done);
                    }
                });
                testInjector.addProviders([completerProvider]);
                runner.run();

                inIt = true;
                testInjector.execute(testFnT);
                inIt = false;
            });
        } else {
            mochaFn(name, () => {
                runner.run();
                return testInjector.execute(testFnT);
            });
        }

    } else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`

        if ((<any>testFn).length === 0) {
            mochaFn(name, () => {
                runner.run();
                return (<SyncTestFn>testFn)();
            });
        } else {
            mochaFn(name, (done: MochaDone) => {
                runner.run();
                let result = (<AsyncTestFn>testFn)(done);
                if (isPromise(result)) {
                    Promise.resolve(result)
                        .then(() => {
                            done();
                        })
                        .catch(error => {
                            done(error);
                        });
                }
            });
        }
    }
}

export function it(name: string, fn: any): void {
    return _it(mochaIt, name, fn);
}

export function xit(name: string, fn: any): void {
    return _it(mochaXIt, name, fn);
}
