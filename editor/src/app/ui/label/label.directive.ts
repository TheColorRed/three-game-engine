import { Directive, HostBinding } from '@angular/core';

@Directive({ selector: '[ui-label]' })
export class LabelDirective {
  @HostBinding('style.cursor') cursor = 'pointer';
}
