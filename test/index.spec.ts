"use strict";

// es6 shim
import "core-js/shim";

// ng2 deps
// import "reflect-metadata";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import "zone.js/dist/zone";
import "zone.js/dist/long-stack-trace-zone";
import "zone.js/dist/async-test";

import "./app/app.component.spec";

import "./common/services/test.service.spec";
import "./common/models/test.model.spec"

import {
    setBaseTestProviders,
    resetBaseTestProviders,
} from "../core";

import {
    BROWSER_APP_DYNAMIC_PROVIDERS
} from "@angular/platform-browser-dynamic";
import {
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
    ADDITIONAL_TEST_BROWSER_PROVIDERS,
} from "@angular/platform-browser/testing/browser_static";

resetBaseTestProviders();
setBaseTestProviders(TEST_BROWSER_STATIC_PLATFORM_PROVIDERS, [BROWSER_APP_DYNAMIC_PROVIDERS, ADDITIONAL_TEST_BROWSER_PROVIDERS]);
