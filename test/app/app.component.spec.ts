import {Component, provide} from "angular2/core";
import {Observable} from "rxjs/Observable";
import {TestService} from "../common/services/test.service.spec";
import {TestModel} from "../common/models/test.model.spec";

@Component({
    selector: "test-app",
    template: `
        <h1>Test App</h1>
        <p>{{ model?.toString() }}</p>
`,
    providers: [TestService]
})
export class TestAppComponent {

    model: TestModel;

    constructor(private testService: TestService) {
    }

    ngOnInit() {
        this.testService.get("AAA")
            .subscribe(resp => {
                this.model = resp;
            });
    }
}

/**
 *  ===== testing world =====
 */

import assert = require("power-assert");
import {
    TestComponentBuilder,
    resetBaseTestProviders,
    setupTestBrowserProviders,
} from "../../core";
import {inject} from "../../framework/mocha";

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

    it("should has text: 'Test App'", inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        return tcb.createAsync(TestAppComponent, [
            provide(TestService, {
                useValue: {
                    get: (id: string) => {
                        return Observable.empty();
                    }
                },
            }),
        ]).then(fixture => {
            let el = fixture.nativeElement as HTMLElement;
            assert(!!el);
            assert(el.querySelector("h1").innerHTML === "Test App");
        });
    }));

    it("should has text: 'Test App'", inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        const mockModel = new TestModel("id");
        return tcb.createAsync(TestAppComponent, [
            provide(TestService, {
                useValue: {
                    get: (id: string) => {
                        return Observable.of(mockModel);
                    }
                },
            }),
        ]).then(fixture => {
            assert(fixture.nativeElement.querySelector("p").innerHTML === "");
            fixture.detectChanges();
            assert(fixture.nativeElement.querySelector("p").innerHTML === mockModel.toString());
        });
    }));
});