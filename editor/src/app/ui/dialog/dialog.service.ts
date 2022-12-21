import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { Subject, Subscription, tap } from 'rxjs';
import { DialogComponent, DialogResultData } from './dialog.component';

export interface DialogOptions {
  width?: number | string;
  disableClose?: boolean;
  data?: any;
  actions?: {
    confirm?: string;
    reject?: string;
  };
}

export class DialogReference<T extends DialogResultData<unknown>> {
  private ref!: DialogRef<T>;

  private accepted = new Subject<T>();
  private canceled = new Subject<void>();
  private cdkCloseSub?: Subscription;

  accepted$ = this.accepted.asObservable();
  canceled$ = this.canceled.asObservable();

  constructor(
    private readonly dialog: Dialog,
    private readonly comp: ComponentType<T>,
    private readonly data?: DialogOptions
  ) {}

  open() {
    this.ref = this.dialog.open(DialogComponent, {
      width: typeof this.data?.width === 'number' ? `${this.data.width}px` : this.data?.width,
      disableClose: this.data?.disableClose,
      autoFocus: '__non_existing_element__',
      backdropClass: 'ui-backdrop',
      data: {
        ref: this,
        comp: this.comp,
        data: this.data?.data,
        actions: this.data?.actions,
      },
    }) as DialogRef<T>;
    this.cdkCloseSub = this.ref.closed
      .pipe(
        tap(i => {
          if (typeof i === 'undefined') this.canceled.next();
          else this.accepted.next(i);
        })
      )
      .subscribe();
  }

  close(data?: T) {
    this.ref.close(data);
    this.cdkCloseSub?.unsubscribe();
  }
}

@Injectable()
export class DialogService {
  constructor(private readonly dialog: Dialog) {}

  open<T extends DialogResultData<any>>(comp: ComponentType<T>, data?: DialogOptions): DialogReference<T['data']> {
    const ref = new DialogReference(this.dialog, comp, data);
    ref.open();
    return ref;
  }
}
