import { ChangeDetectorRef, Component, DoCheck, Host } from '@angular/core';
import { faChevronRight } from '@fortawesome/sharp-solid-svg-icons';
import { BreadcrumbsComponent } from '../breadcrumbs.component';

@Component({
  selector: 'ui-breadcrumb, a[ui-breadcrumb]',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements DoCheck {
  separatorIcon = faChevronRight;
  /** Wether or not this is the last breadcrumb. */
  isLast = false;

  constructor(@Host() private readonly breadcrumbs: BreadcrumbsComponent, public readonly cd: ChangeDetectorRef) {}

  ngDoCheck() {
    this.update();
  }

  update() {
    const breadcrumbs = this.breadcrumbs.breadcrumbs;
    this.isLast = breadcrumbs?.last === this ?? (breadcrumbs?.length ?? 0) <= 1;
    this.cd.markForCheck();
  }
}
