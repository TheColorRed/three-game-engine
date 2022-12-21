import { ChangeDetectorRef, Component, ContentChildren, QueryList } from '@angular/core';
import { filter, tap } from 'rxjs';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@Component({
  selector: 'ui-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent {
  /**
   * A list of all the breadcrumbs.
   * Used in the breadcrumb component to find the last breadcrumb.
   */
  @ContentChildren(BreadcrumbComponent) breadcrumbs!: QueryList<BreadcrumbComponent>;

  constructor(private readonly cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.breadcrumbs.changes
      .pipe(
        filter((i): i is QueryList<BreadcrumbComponent> => i instanceof QueryList),
        tap(() => this.cd.markForCheck()),
        tap(() => this.cd.detectChanges()),
        tap(i => i.forEach((j: BreadcrumbComponent) => j.cd.markForCheck())),
        tap(i => i.forEach((j: BreadcrumbComponent) => j.cd.detectChanges()))
      )
      .subscribe();
  }
}
