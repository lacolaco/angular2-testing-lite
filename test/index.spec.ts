"use strict";

// es6 shim
import "core-js/shim";

// ng2 deps
import "reflect-metadata";
import "rxjs/Rx";
import "zone.js/dist/zone";
import "zone.js/dist/long-stack-trace-zone";

import "./app/app.component.spec";

import "./common/services/test.service.spec";
import "./common/models/test.model.spec"