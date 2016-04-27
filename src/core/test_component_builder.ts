/**
 * Port angular2/testing TestComponentBuilder for Jasmine-free testing
 * Original: [https://github.com/angular/angular/blob/master/modules/angular2/src/testing/test_component_builder.ts]
 */

import {
    Injectable, Injector, ComponentRef, DynamicComponentLoader, ElementRef, ChangeDetectorRef, Type
} from "angular2/core";
import {DebugElement, getDebugNode} from "angular2/src/core/debug/debug_node";
import {DirectiveResolver} from "angular2/compiler";
import {DOCUMENT} from "angular2/platform/browser";
import {MockDirectiveResolver} from "./directive_resolver_mock";

export class ComponentFixture {

    debugElement: DebugElement;

    componentInstance: any;

    nativeElement: any;

    elementRef: ElementRef;

    componentRef: ComponentRef;

    changeDetectorRef: ChangeDetectorRef;

    constructor(componentRef: ComponentRef) {
        this.changeDetectorRef = componentRef.changeDetectorRef;
        this.elementRef = componentRef.location;
        this.debugElement = <DebugElement>getDebugNode(this.elementRef.nativeElement);
        this.componentInstance = componentRef.instance;
        this.nativeElement = this.elementRef.nativeElement;
        this.componentRef = componentRef;
    }
    
    detectChanges(checkNoChanges: boolean = true): void {
        this.changeDetectorRef.detectChanges();
        if (checkNoChanges) {
            this.checkNoChanges();
        }
    }

    checkNoChanges(): void {
        this.changeDetectorRef.checkNoChanges();
    }
    
    destroy(): void {
        this.componentRef.destroy();
    }
}

@Injectable()
export class TestComponentBuilder {

    private static _nextRootElementID = 0;

    constructor(private _injector: Injector) {
    }

    createAsync(rootComponentType: Type, overrideProviders: any[] = []): Promise<ComponentFixture> {
        const directiveResolver = this._injector.get(DirectiveResolver) as MockDirectiveResolver;

        directiveResolver.setProvidersOverride(rootComponentType, overrideProviders);

        const rootElId = `root${TestComponentBuilder._nextRootElementID++}`;
        const doc = this._injector.get(DOCUMENT) as Document;
        var oldRoots = doc.body.querySelectorAll("[id^=root]");
        for (var i = 0; i < oldRoots.length; i++) {
            doc.body.removeChild(oldRoots[i]);
        }
        const rootEl = doc.createElement("div");
        rootEl.id = rootElId;
        doc.body.appendChild(rootEl);
        const loader = this._injector.get(DynamicComponentLoader) as DynamicComponentLoader;
        return loader.loadAsRoot(rootComponentType, `#${rootElId}`, this._injector)
            .then(cmpRef => new ComponentFixture(cmpRef));
    }
}