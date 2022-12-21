import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Component, ComponentRef, Inject, Injector, ViewChild } from '@angular/core';
import { DialogOutletDirective } from './dialog-outlet.directive';
import { DialogOptions, DialogReference } from './dialog.service';

interface DialogInjectionData {
  comp: ComponentType<any>;
  actions: DialogOptions['actions'];
  ref: DialogReference<any>;
}

export interface DialogResultData<T> {
  data?: T;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent<T extends { data?: any } = object> {
  component: ComponentType<T>;

  @ViewChild(DialogOutletDirective, { static: true }) dialogOutlet!: DialogOutletDirective;

  confirm?: string;
  reject?: string;
  componentRef?: ComponentRef<T>;

  valid: boolean = true;

  constructor(@Inject(DIALOG_DATA) private readonly data: DialogInjectionData) {
    this.component = this.data.comp;
    this.confirm = this.data.actions?.confirm;
    this.reject = this.data.actions?.reject;
  }

  ngOnInit() {
    this.componentRef = this.dialogOutlet.viewContainerRef.createComponent(this.data.comp, {
      injector: Injector.create({ providers: [{ provide: DialogComponent, useValue: this }] }),
    });
  }
  /**
   * Close button handled from the template.
   */
  close(sendData = true) {
    const data = this.componentRef?.instance?.data;
    this.data.ref.close(sendData ? data : undefined);
  }
}
