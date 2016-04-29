/**
 * testing utilities for Mocha
 * Original: https://github.com/angular/angular/blob/2.0.0-beta.16/modules/angular2/src/testing/testing.ts
 */

import {global} from "angular2/src/facade/lang";
import {FunctionWithParamTokens, getTestInjector} from "../core/test_injector";

const _global = <any>(typeof window === "undefined" ? global : window);

/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
export const afterEach: Function = _global.afterEach;

/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export const describe: Function = _global.describe;

/**
 * Like {@link describe}, but instructs the test runner to exclude
 * this group of test cases from execution. This is useful for
 * debugging, or for excluding broken tests until they can be fixed.
 */
export const xdescribe: Function = _global.xdescribe;

/**
 * Signature for a synchronous test function (no arguments).
 */
export type SyncTestFn = () => void;

/**
 * Signature for an asynchronous test function which takes a
 * `done` callback.
 */
export type AsyncTestFn = (done: () => void) => void;

/**
 * Signature for any simple testing function.
 */
export type AnyTestFn = SyncTestFn | AsyncTestFn | Function;

const mochaBeforeEach: (action: (done?: MochaDone) => void) => void = _global.beforeEach;
const mochaIt: Mocha.ITestDefinition = _global.it;
const mochaXIt: Mocha.ITestDefinition = _global.xit;

const testInjector = getTestInjector();

// Reset the test providers before each test
mochaBeforeEach(() => {
    testInjector.reset();
});

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
        const providers = fn();
        if (!providers) return;
        try {
            testInjector.addProviders(providers);
        } catch (e) {
            throw new Error('beforeEachProviders was called after the injector had ' +
                'been used in a beforeEach or it block. This invalidates the ' +
                'test injector');
        }
    });
}

function runInAsyncTestZone(fnToExecute: Function, finishCallback: Function, failCallback: Function,
                            testName = ""): any {
    const AsyncTestZoneSpec = (<any>Zone)["AsyncTestZoneSpec"];
    const testZoneSpec = new AsyncTestZoneSpec(finishCallback, failCallback, testName);
    testZoneSpec.onHandleError = (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any) => {
        const result = parentZoneDelegate.handleError(targetZone, error);
        if (result) {
            testZoneSpec._failCallback(error);
            testZoneSpec._alreadyErrored = true;
            return true;
        }
        return false;
    };
    const testZone = Zone.current.fork(testZoneSpec);
    return testZone.runGuarded(fnToExecute);
}

function _it(mochaFn: Function, name: string, testFn: FunctionWithParamTokens | AnyTestFn): void {
    if (testFn instanceof FunctionWithParamTokens) {
        let testFnT = testFn;
        if (testFnT.isAsync) {
            mochaFn(name, (done: MochaDone) => {
                runInAsyncTestZone(() => testInjector.execute(testFnT), () =>done(), done, name);
            });
        } else {
            mochaFn(name, () => {
                return testInjector.execute(testFnT);
            });
        }
    } else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        if ((<any>testFn).length === 0) {
            mochaFn(name, () => {
                return (<SyncTestFn>testFn)();
            });
        } else {
            mochaFn(name, (done: MochaDone) => {
                (<AsyncTestFn>testFn)(done);
            });
        }
    }
}

/**
 * Wrapper around Mocha beforeEach function.
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 */
export function beforeEach(fn: FunctionWithParamTokens | AnyTestFn): void {
    if (fn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        let fnT = fn;
        if (fnT.isAsync) {
            mochaBeforeEach((done: MochaDone) => {
                runInAsyncTestZone(() => testInjector.execute(fnT), () =>done(), done, "beforeEach");
            });
        } else {
            mochaBeforeEach(() => {
                return testInjector.execute(fnT);
            });
        }
    } else {
        // The test case doesn't use inject(). ie `beforeEach((done) => { ... }));`
        if ((<any>fn).length === 0) {
            mochaBeforeEach(() => {
                (<SyncTestFn>fn)();
            });
        } else {
            mochaBeforeEach((done) => {
                (<AsyncTestFn>fn)(done);
            });
        }
    }
}

/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, the result of {@link async},
 * or an injected function created via {@link inject}.
 *
 * Wrapper around Mocha it function. See http://jasmine.github.io/ for more details.
 */
export function it(name: string, fn: FunctionWithParamTokens | AnyTestFn): void {
    return _it(mochaIt, name, fn);
}

/**
 * Like {@link it}, but instructs the test runner to exclude this test
 * entirely. Useful for debugging or for excluding broken tests until
 * they can be fixed.
 *
 * Wrapper around Mocha xit function. See http://jasmine.github.io/ for more details.
 */
export function xit(name: string, fn: FunctionWithParamTokens | AnyTestFn): void {
    return _it(mochaXIt, name, fn);
}
