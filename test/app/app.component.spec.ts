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
import {describe, it, xit, beforeEach} from "../../mocha";
import {By} from "angular2/platform/browser";
import {Observable} from "rxjs/Observable";

class MockTestService {

    get(id: string): Observable<TestModel> {
        return Observable.of(new TestModel(id));
    }
}

describe("TestAppComponent", () => {
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        builder = tcb.overrideProviders(TestAppComponent, [
            provide(TestService, {useClass: MockTestService})
        ]);
    }));

    it("can create", async(() => {
            builder.createAsync(TestAppComponent)
                .then(fixture => {
                    assert(!!fixture);
                });
        })
    );

    it("should has text: 'Test App'", async(() => {
            builder.createAsync(TestAppComponent)
                .then(fixture => {
                    let el = fixture.debugElement;
                    assert(el.query(By.css("h1")).nativeElement.innerHTML === "Test App");
                });
        })
    );

    it("should apply ngOnInit on detectChanges()", async(() => {
            builder.createAsync(TestAppComponent).then(fixture => {
                let el = fixture.debugElement;
                assert(el.query(By.css("p")).nativeElement.innerHTML === "");
                fixture.detectChanges();
                assert(el.query(By.css("p")).nativeElement.innerHTML !== "");
            });
        })
    );
});