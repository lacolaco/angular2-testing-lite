# angular2-testing-micro
[![Circle CI](https://circleci.com/gh/laco0416/angular2-testing-micro/tree/master.svg?style=svg)](https://circleci.com/gh/laco0416/angular2-testing-micro/tree/master)
[![npm version](https://badge.fury.io/js/angular2-testing-micro.svg)](https://badge.fury.io/js/angular2-testing-micro)

Jasmine-free Angular 2 Testing Library

## Why micro?
`angular2/testing` depends on Jasmine and wraps it for DI.
I need _Jasmine-free_ testing library for Angular2 because I want ...

- Simple API
- Less code
- Custom assertion (I ♥ [power-assert](https:://github.com/power-assert-js/power-assert))

## Install

```
$ npm install --save-dev angualr2-testing-micro
```

## Usage ([Mocha](https://github.com/mochajs/mocha) & [power-assert](https:://github.com/power-assert-js/power-assert) example)

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
describe("TestService", () => {

    beforeEach(() => {
        resetBaseTestProviders();
        getTestInjector().addProviders([
            BaseRequestOptions,
            MockBackend,
            provide(Http, {
                useFactory: (backend: MockBackend, options: BaseRequestOptions) => {
                    return new Http(backend, options);
                }, deps: [MockBackend, BaseRequestOptions]
            }),
            TestService
        ]);
    });

    it("can instantiate", inject([TestService], (service: TestService) => {
        assert(!!service);
    }));
});
```

### Component
Ported `TestComponentBuilder`

```ts
describe("TestAppComponent", () => {

    beforeEach(() => {
        resetBaseTestProviders();
        setupTestBrowserProviders();
    });

    it("can create", inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        return tcb.createAsync(TestAppComponent, [
                provide(TestService, {
                    useValue: {
                        get: (id: string) => {
                            return Observable.empty();
                        }
                    },
                }),
            ])
            .then(fixture => {
                assert(!!fixture);
            });
    }));
});
```


### License
MIT
