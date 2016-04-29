/**
 * Override default zone spec to allow non-Error assertion.
 */
export function overrideZoneSpec(): void {
    let asyncTestZoneSpec = (<any>Zone)["AsyncTestZoneSpec"];
    if (!asyncTestZoneSpec) {
        console.warn("'zone.js/dist/async-test' is not loaded.");
        return;
    }
    asyncTestZoneSpec.onHandleError = (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any) => {
        const result = parentZoneDelegate.handleError(targetZone, error);
        if (result) {
            // NOTE: origin
            // this._failCallback(error.message ? error.message : 'unknown error');
            asyncTestZoneSpec._failCallback(error);
            asyncTestZoneSpec._alreadyErrored = true;
        }
        return false;
    };
}