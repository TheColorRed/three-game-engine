import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[ui-link]'
})
export class LinkDirective {

  @HostBinding('style')
  get elementStyle() {
    return {
      'text-decoration': 'none',
      color: 'orange'
    };
  }
}
