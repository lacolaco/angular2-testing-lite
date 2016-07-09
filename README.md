# angular2-testing-lite
[![Circle CI](https://circleci.com/gh/laco0416/angular2-testing-lite/tree/master.svg?style=svg)](https://circleci.com/gh/laco0416/angular2-testing-lite/tree/master)
[![npm version](https://badge.fury.io/js/angular2-testing-lite.svg)](https://badge.fury.io/js/angular2-testing-lite)

# OBSOLUTED
Since RC.4, Angular 2 no longer depends on Jasmine API.
**Please use official testing APIs. :)**

----

Jasmine-free Angular 2 Testing Library

## Features

- **Jasmine-free**
- Same core API as `angular2/testing`
- Less API: supports only `TestInjector` and `TestComponentBuilder`
- Opt-in utilities for [Mocha](https://github.com/mochajs/mocha)

## Install

```
$ npm install --save-dev angular2-testing-lite
```

## Usage ([Mocha](https://github.com/mochajs/mocha) & [power-assert](https:://github.com/power-assert-js/power-assert) example)

### Setup

At an entry point of tests, you should set up a testing environment.

```ts
import {
    setBaseTestProviders,
    resetBaseTestProviders,
} from "angular2-testing-lite/core";

import {
    BROWSER_APP_DYNAMIC_PROVIDERS
} from "@angular/platform-browser-dynamic";

import {
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
    ADDITIONAL_TEST_BROWSER_PROVIDERS,
} from "@angular/platform-browser/testing/browser_static";

resetBaseTestProviders();
setBaseTestProviders(TEST_BROWSER_STATIC_PLATFORM_PROVIDERS, [BROWSER_APP_DYNAMIC_PROVIDERS, ADDITIONAL_TEST_BROWSER_PROVIDERS]);
```

See [/test/index.spec.ts](https://github.com/laco0416/angular2-testing-lite/blob/master/test/index.spec.ts)

### Model

Simple mocha test

```ts
import assert = require("power-assert");

describe("TestModel", () => {

    it("can instantiate", () => {
        let model = new TestModel("AAA");
        assert(!!model);
    });

    describe("toString()", () => {
        it("should return string", () => {
            const model = new TestModel("AAA");
            const str = model.toString();
            assert(typeof str === "string");
        });
    });
});
```

### Service
Inject `Http`

```ts
import assert = require("power-assert");
import {async, inject} from "angular2-testing-lite/core";
import {it, describe, xdescribe, beforeEach, beforeEachProviders} from "angular2-testing-lite/mocha";

describe("TestService", () => {

    beforeEachProviders(() => [
        BaseRequestOptions,
        MockBackend,
        provide(Http, {
            useFactory: (backend: MockBackend, options: BaseRequestOptions) => {
                return new Http(backend, options);
            }, deps: [MockBackend, BaseRequestOptions]
        }),
        TestService
    ]);

    it("can instantiate", inject([TestService], (service: TestService) => {
        assert(!!service);
    }));
});
```

### Component
Ported `TestComponentBuilder`

```ts
import assert = require("power-assert");
import {inject, async, TestComponentBuilder} from "angular2-testing-lite/core";
import {describe, it, xit, beforeEachProviders, beforeEach} from "angular2-testing-lite/mocha";
import {HTTP_PROVIDERS} from "@angular/http";

describe("TestAppComponent", () => {

    beforeEachProviders(() => [
        HTTP_PROVIDERS,
        TestService,
    ]);

    it("can create", async(inject([TestComponentBuilder],
        (tcb: TestComponentBuilder) => {
            return tcb.createAsync(TestAppComponent)
                .then(fixture => {
                    assert(!!fixture);
                });
        })
    ));
});
```


### License
MIT
