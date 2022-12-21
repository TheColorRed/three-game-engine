import { Component, ContentChild } from '@angular/core';
import { FormFieldActionsDirective } from './form-field-actions.directive';

@Component({
  selector: 'ui-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  @ContentChild(FormFieldActionsDirective)
  actions!: FormFieldActionsDirective;
}
