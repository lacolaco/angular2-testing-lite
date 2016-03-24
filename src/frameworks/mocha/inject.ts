/**
 * inject for mocha
 */

import {getTestInjector, FunctionWithParamTokens} from "../../core/test_injector";

export function inject(tokens: any[], fn: Function): any {
    return () => {
        return getTestInjector().execute(new FunctionWithParamTokens(tokens, fn));
    };
}
