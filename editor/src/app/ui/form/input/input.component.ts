import { Component, ElementRef, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'input[ui-input]',
  template: '',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input() size: 'sm' | 'md' = 'md';

  @HostBinding('class.small')
  get elementSize() {
    return this.size === 'sm';
  }

  get value() {
    return this.elementRef.nativeElement.value;
  }

  constructor(private readonly elementRef: ElementRef<HTMLInputElement>) {}
}
