/**
 * Port angular2/testing TestComponentBuilder for Jasmine-free testing
 * Original: [https://github.com/angular/angular/blob/master/modules/angular2/src/testing/test_component_builder.ts]
 */

import {
    Injectable, Injector, DirectiveResolver, ComponentRef, DynamicComponentLoader, ElementRef, ChangeDetectorRef
} from "angular2/core";
import {DOCUMENT} from "angular2/platform/browser";
import {Type} from "./lang";
import {MockDirectiveResolver} from "./directive_resolver_mock";

export abstract class ComponentFixture {
  componentInstance: any;

  nativeElement: any;

  elementRef: ElementRef;

  abstract detectChanges(): void;

  abstract destroy(): void;
}

export class ComponentFixture_ extends ComponentFixture {
  _componentRef: ComponentRef;
  _componentParentView: {
      changeDetector: ChangeDetectorRef;
      appElements: any[];
      rootNodesOrAppElements: any[];
  };

  constructor(componentRef: ComponentRef) {
    super();
    this._componentParentView = (componentRef.hostView as any).internalView;
    this.elementRef = this._componentParentView.appElements[0].ref;
    this.componentInstance = componentRef.instance;
    this.nativeElement = componentRef.location.nativeElement;
    this._componentRef = componentRef;
  }

  detectChanges(): void {
    this._componentParentView.changeDetector.detectChanges();
    this._componentParentView.changeDetector.checkNoChanges();
  }

  destroy(): void { this._componentRef.dispose(); }
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
        var oldRoots = doc.body.querySelectorAll('[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            doc.body.removeChild(oldRoots[i]);
        }
        const rootEl = doc.createElement("div");
        rootEl.id = rootElId;
        doc.body.appendChild(rootEl);
        const loader = this._injector.get(DynamicComponentLoader) as DynamicComponentLoader;
        return loader.loadAsRoot(rootComponentType, `#${rootElId}`, this._injector)
            .then(cmpRef => new ComponentFixture_(cmpRef));
    }
}