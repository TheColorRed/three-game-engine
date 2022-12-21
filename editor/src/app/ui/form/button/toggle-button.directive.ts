import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[ui-button-toggle][ui-button], [ui-button-toggle][ui-button-fab], [ui-button-toggle][ui-button-icon]',
  exportAs: 'buttonToggle',
})
export class ToggleButtonDirective {
  /** The state of the button. */
  @Input('ui-button-toggle') isToggled = false;
  @Output() toggled = new EventEmitter<boolean>();

  @HostBinding('class.ui-button-toggle')
  buttonToggle = true;

  @HostBinding('class.ui-button-toggled')
  get buttonToggled() {
    return this.isToggled;
  }

  @HostListener('click')
  clicked() {
    this.isToggled = !this.isToggled;
    this.toggled.emit(this.isToggled);
  }
}
