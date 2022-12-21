import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { faCheck } from '@fortawesome/sharp-solid-svg-icons';

@Component({
  selector: 'ui-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => CheckboxComponent) }],
})
export class CheckboxComponent implements ControlValueAccessor {
  private _value = false;
  @Input()
  set value(val: boolean) {
    this.writeValue(val);
  }
  checkIcon = faCheck;
  onChange = (obj: boolean) => {};
  onTouch = () => {};
  writeValue(obj: boolean): void {
    if (typeof obj !== 'undefined') {
      this._value = obj;
      this.onChange(this._value);
      this.onTouch();
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  // setDisabledState?(isDisabled: boolean): void {
  //   throw new Error('Method not implemented.');
  // }
}
