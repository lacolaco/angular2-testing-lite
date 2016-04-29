/**
 * testing utilities for Mocha
 * Original: https://github.com/angular/angular/blob/master/modules/angular2/src/testing/testing.ts
 */

import {global, isPromise} from "angular2/src/facade/lang";
import {getTestInjector, TestInjector} from "../core/test_injector";

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

const mochaBeforeEach: (action: (done?: MochaDone) => void) => void = _global.beforeEach;
const mochaIt: Mocha.ITestDefinition = _global.it;
const mochaXIt: Mocha.ITestDefinition = _global.xit;

const testInjector: TestInjector = getTestInjector();

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

function _wrapTestFn(fn: Function) {
  // Wraps a test or beforeEach function to handle synchronous and asynchronous execution.
  return (done: MochaDone) => {
    if (fn.length === 0) {
      let retVal = fn();
      if (isPromise(retVal)) {
        // Asynchronous test function - wait for completion.
        (<Promise<any>>retVal).then(() => done(), done);
      } else {
        // Synchronous test function - complete immediately.
        done();
      }
    } else {
      // Asynchronous test function that takes "done" as parameter.
      fn(done);
    }
  };
}

function _it(mochaFn: Function, name: string, testFn: Function): void {
    mochaFn(name, _wrapTestFn(testFn));
}

/**
 * Wrapper around Mocha beforeEach function.
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 */
export function beforeEach(fn: Function): void {
    mochaBeforeEach(_wrapTestFn(fn));
}

/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, the result of {@link async},
 * or an injected function created via {@link inject}.
 *
 * Wrapper around Mocha it function.
 */
export function it(name: string, fn: Function): void {
    return _it(mochaIt, name, fn);
}

/**
 * Like {@link it}, but instructs the test runner to exclude this test
 * entirely. Useful for debugging or for excluding broken tests until
 * they can be fixed.
 *
 * Wrapper around Mocha xit function.
 */
export function xit(name: string, fn: Function): void {
    return _it(mochaXIt, name, fn);
}
