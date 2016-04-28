"use strict";

// es6 shim
import "core-js/shim";

// ng2 deps
import "reflect-metadata";
import "rxjs/Rx";
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

import {TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS} from "angular2/platform/testing/browser";

resetBaseTestProviders();
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);
