import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[ui-layout-container]',
})
export class TabContainerDirective {
  @HostBinding('class')
  get elementClass() {
    return {
      flex: true,
      'flex-row': true,
      'h-full': true,
      'w-full': true,
    };
  }
}
