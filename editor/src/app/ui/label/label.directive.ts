import { Directive, HostBinding, Input } from '@angular/core';

@Directive({ selector: '[ui-label]' })
export class LabelDirective {
  @Input('size') size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @HostBinding('style.cursor') cursor = 'pointer';
  // @HostBinding('class.')
  // get fontSize() {
  //   if(this.size ==='sm') return ;
  // }
}
