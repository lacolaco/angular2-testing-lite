import {Component, provide} from "angular2/core";
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
import {inject, async, TestComponentBuilder} from "../../core";
import {describe, it, xit, beforeEachProviders, beforeEach} from "../../mocha";
import {By} from "angular2/platform/browser";
import {HTTP_PROVIDERS} from "angular2/http";

describe("TestAppComponent", () => {

    let mockModel: TestModel;
    beforeEachProviders(() => [
        HTTP_PROVIDERS,
        TestService,
    ]);
    
    beforeEach(() => {
        mockModel = new TestModel("id");
    });

    it("can create", async(inject([TestComponentBuilder],
        (tcb: TestComponentBuilder) => {
            return tcb.createAsync(TestAppComponent)
                .then(fixture => {
                    assert(!!fixture);
                });
        })
    ));

    it("should has text: 'Test App'", async(inject([TestComponentBuilder],
        (tcb: TestComponentBuilder) => {
            return tcb.createAsync(TestAppComponent)
                .then(fixture => {
                    let el = fixture.debugElement;
                    assert(el.query(By.css("h1")).nativeElement.innerHTML === "Test App");
                });
        })
    ));

    it("should has text: 'Test App'", async(inject([TestComponentBuilder],
        (tcb: TestComponentBuilder) => {
            return tcb.createAsync(TestAppComponent).then(fixture => {
                let el = fixture.debugElement;
                assert(el.query(By.css("p")).nativeElement.innerHTML === "");
                let cmp = fixture.componentInstance as TestAppComponent;
                cmp.model = mockModel;
                fixture.detectChanges();
                assert(el.query(By.css("p")).nativeElement.innerHTML === mockModel.toString());
            });
        })
    ));
});