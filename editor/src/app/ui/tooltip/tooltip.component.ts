import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {

  @Input() message?: string;
  @Input() template?: TemplateRef<any>;

}
