/**
 * Port angular2/testing TestInjector for Jasmine-free testing
 * Original: [https://github.com/angular/angular/blob/master/modules/angular2/src/testing/test_injector.ts]
 */

import {ReflectiveInjector, Provider, PLATFORM_INITIALIZER, Type} from "angular2/core";
import {DirectiveResolver} from 'angular2/compiler';
import {
    TEST_BROWSER_PLATFORM_PROVIDERS as _PLATFORM,
    TEST_BROWSER_APPLICATION_PROVIDERS as _APPLICATION
} from "angular2/platform/testing/browser";
import {MockDirectiveResolver} from "./directive_resolver_mock";
import {TestComponentBuilder} from "./test_component_builder";

export const TEST_BROWSER_PLATFORM_PROVIDERS = _PLATFORM;
export const TEST_BROWSER_APPLICATION_PROVIDERS = _APPLICATION.concat([
    TestComponentBuilder,
    new Provider(DirectiveResolver, {useClass: MockDirectiveResolver})
]);

export class TestInjector {
    private _injector: ReflectiveInjector;
    private _instantiated: boolean;
    private _providers: Array<Type | Provider | any[]> = [];

    platformProviders: Array<Type | Provider | any[]> = [];

    applicationProviders: Array<Type | Provider | any[]> = [];

    reset() {
        this._injector = null;
        this._providers = [];
        this._instantiated = false;
    }

    createInjector(): ReflectiveInjector {
        var rootInjector = ReflectiveInjector.resolveAndCreate(this.platformProviders);
        this._injector = rootInjector.resolveAndCreateChild(this.applicationProviders.concat(this._providers));
        this._instantiated = true;
        return this._injector;
    }

    addProviders(providers: Array<Type | Provider | any[]>) {
        if (this._instantiated) {
            throw 'Cannot add providers after test injector is instantiated';
        }
        this._providers = this._providers.concat(providers);
    }

    execute(fn: FunctionWithParamTokens): any {
        var additionalProviders = fn.additionalProviders;
        if (additionalProviders.length > 0) {
            this.addProviders(additionalProviders);
        }
        if (!this._instantiated) {
            this.createInjector();
        }
        return fn.execute(this._injector);
    }
}

/**
 * Global injector for testing
 */
var _testInjector: TestInjector = null;

export function getTestInjector() {
    if (_testInjector == null) {
        _testInjector = new TestInjector();
    }
    return _testInjector;
}

export function setBaseTestProviders(platformProviders: Array<Type | Provider | any[]>,
                                     applicationProviders: Array<Type | Provider | any[]>) {
    var testInjector = getTestInjector();
    if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
        throw 'Cannot set base providers because it has already been called';
    }
    testInjector.platformProviders = platformProviders;
    testInjector.applicationProviders = applicationProviders;
    var injector = testInjector.createInjector();
    let inits: Function[] = injector.get(PLATFORM_INITIALIZER, null);
    if (inits) {
        inits.forEach(init => init());
    }
    testInjector.reset();
}

export function setupTestBrowserProviders(bootstrapProviders?:Array<Type | Provider | any[]>) {
    setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS.concat(bootstrapProviders), 
        TEST_BROWSER_APPLICATION_PROVIDERS);
}

export function resetBaseTestProviders() {
    var testInjector = getTestInjector();
    testInjector.platformProviders = [];
    testInjector.applicationProviders = [];
    testInjector.reset();
}

export class FunctionWithParamTokens {
    constructor(private _tokens: any[], private _fn: Function, public additionalProviders: Array<Type | Provider | any[]> = []) {
    }

    execute(injector: ReflectiveInjector): any {
        const params = this._tokens.map(t => injector.get(t));
        return this._fn.apply(null, params);
    }

    hasToken(token: any): boolean {
        return this._tokens.indexOf(token) > -1;
    }
}