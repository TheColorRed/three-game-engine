import { Component, ContentChild, Input } from '@angular/core';
import { InputComponent } from '@ui/form/input/input.component';
import { FormFieldActionsDirective } from './form-field-actions.directive';

@Component({
  selector: 'ui-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  /** The direction to display the input. */
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';

  @ContentChild(FormFieldActionsDirective)
  actions!: FormFieldActionsDirective;

  @ContentChild(InputComponent, { static: true }) input?: InputComponent;
}
