export class TestModel {
    createdAt: number;

    constructor(public text: string) {
        this.createdAt = new Date().getTime();
    }

    toString(): string {
        return `[${this.createdAt.toString()}] ${this.text}`;
    }
}

/**
 *  ===== testing world =====
 */

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