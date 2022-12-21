import { Component, HostBinding, Input, TemplateRef } from '@angular/core';

@Component({
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent {
  @Input() message?: string;
  @Input() template?: TemplateRef<any>;
  @Input() width = Infinity;

  @HostBinding('style.width')
  get tooltipWidth() {
    return this.width === Infinity ? undefined : `${this.width}px`;
  }
}
