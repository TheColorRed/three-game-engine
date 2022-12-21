import { Component, ContentChild, DoCheck, HostBinding, Input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: '[ui-button], [ui-button-fab], [ui-button-icon]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements DoCheck {
  isFab = false;
  isButton = false;
  isIcon = false;

  @ContentChild(FaIconComponent)
  buttonIcon?: FaIconComponent;

  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input('ui-button-fab')
  set fab(val: string | undefined) {
    if (typeof val === 'string') {
      this.isFab = true;
    }
  }
  @Input('ui-button-icon')
  set icon(val: string | undefined) {
    if (typeof val === 'string') {
      this.isIcon = true;
    }
  }
  @Input('ui-button')
  set button(val: string | undefined) {
    if (typeof val === 'string') {
      this.isButton = true;
    }
  }

  @HostBinding('class')
  get btnClass() {
    return {
      'size--sm': this.size === 'sm',
      'size--md': this.size === 'md',
      'size--lg': this.size === 'lg',
    };
  }

  ngDoCheck() {}
}
