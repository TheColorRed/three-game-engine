import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[dialog-outlet]' })
export class DialogOutletDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
