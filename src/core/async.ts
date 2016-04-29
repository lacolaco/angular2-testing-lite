/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', async(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * });
 * ```
 */
export function async(fn: Function): Function {
    return () => {
        return new Promise<void>((finishCallback, failCallback) => {
            const AsyncTestZoneSpec = (<any>Zone)['AsyncTestZoneSpec'];
            let testZoneSpec = new AsyncTestZoneSpec(finishCallback, failCallback, 'test');
            // Override default error handler
            testZoneSpec.onHandleError = (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any) => {
                const result = parentZoneDelegate.handleError(targetZone, error);
                if (result) {
                    // NOTE: origin
                    // testZoneSpec._failCallback(error.message ? error.message : 'unknown error');
                    testZoneSpec._failCallback(error);
                    testZoneSpec._alreadyErrored = true;
                }
                return false;
            };
            const testZone = Zone.current.fork(testZoneSpec);
            // enable onHandleError 
            return testZone.runGuarded(fn);
        });
    }
}