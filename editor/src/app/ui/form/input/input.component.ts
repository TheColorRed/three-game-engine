import { Component, ElementRef, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'input[ui-input]',
  template: '',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input() size: 'xs' | 'sm' | 'md' = 'md';

  @HostBinding('class')
  get elementSize() {
    return {
      small: this.size === 'sm',
      'x-small': this.size === 'xs',
    };
  }

  get value() {
    return this.elementRef.nativeElement.value;
  }

  constructor(private readonly elementRef: ElementRef<HTMLInputElement>) {}
}
