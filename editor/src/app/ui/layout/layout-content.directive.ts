import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[ui-layout-content]',
})
export class ContentDirective {
  @Input('min-width') minWidth = '100px';

  @HostBinding('class')
  get elementClass() {
    const props: { [key: string]: boolean } = {
      flex: true,
      grow: true,
      'h-full': true,
      'w-0': true,
      'place-content-center': true,
      'place-items-center': true,
      'bg-[var(--colors-main-background-lighter)]': true,
    };
    props[`min-w-[${this.minWidth}]`] = true;
    return props;
  }
}
