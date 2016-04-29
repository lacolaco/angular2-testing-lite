import {Injectable, provide} from "angular2/core";
import {Http, BaseRequestOptions, Response, ResponseOptions} from "angular2/http";
import {TestModel} from "../models/test.model.spec";
import {Observable} from "rxjs/Observable";

@Injectable()
export class TestService {

    constructor(private http: Http) {
    }

    get(id: string): Observable<TestModel> {
        return this.http.get(`/${id}`)
            .map(resp => resp.json() as TestModel);
    }
}

/**
 *  ===== testing world =====
 */

import assert = require("power-assert");
import {MockBackend, MockConnection} from "angular2/http/testing";
import {async, inject} from "../../../core";
import {it, describe, xdescribe, beforeEach, beforeEachProviders} from "../../../mocha";

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

    describe("get(id)", () => {

        beforeEach(inject([MockBackend], (backend: MockBackend) => {
            backend.connections.subscribe((c: MockConnection) => {
                let resp = new TestModel("mocked!");
                c.mockRespond(
                    new Response(new ResponseOptions({
                        status: 200,
                        body: resp
                    }))
                );
            });
        }));

        it("should return mocked TestModel", async(inject([TestService],
            (service: TestService) => {
                service.get("test").toPromise()
                    .then(resp => {
                        assert(!!resp);
                        assert(resp.text === "mocked!");
                    });
            })
        ));
    });
});