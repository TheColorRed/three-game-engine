import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[ui-layout-sidebar]',
})
export class SidebarDirective {
  @Input() width = '300px';
  @Input('min-width') minWidth = '300px';

  @HostBinding('style.background-color') backgroundColor = 'var(--colors-main-background-light)';

  @HostBinding('class')
  get elementClass() {
    const width = `w-[${this.width}]`;
    const minWidth = `min-w-[${this.minWidth}]`;
    const props: { [key: string]: boolean } = {
      flex: true,
      'flex-col': true,
      'gap-[var(--spacing-s)]': true,
      'p-[var(--spacing-s)]': true,
      'h-full': true,
    };
    props[width] = true;
    props[minWidth] = true;
    return props;
  }
}
