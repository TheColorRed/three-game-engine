import { DialogModule } from '@angular/cdk/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BreadcrumbComponent } from './breadcrumbs/breadcrumb/breadcrumb.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { CardActionComponent } from './card/card-action/card-action.component';
import { CardContentComponent } from './card/card-content/card-content.component';
import { CardTitleComponent } from './card/card-title/card-title.component';
import { CardComponent } from './card/card.component';
import { DialogOutletDirective } from './dialog/dialog-outlet.directive';
import { DialogComponent } from './dialog/dialog.component';
import { FormFieldActionsDirective } from './form-field/form-field-actions.directive';
import { FormFieldComponent } from './form-field/form-field.component';
import { ButtonComponent } from './form/button/button.component';
import { ToggleButtonDirective } from './form/button/toggle-button.directive';
import { CheckboxComponent } from './form/checkbox/checkbox.component';
import { InputComponent } from './form/input/input.component';
import { LabelDirective } from './label/label.directive';
import { DragbarDirective } from './layout/dragbar/dragbar.component';
import { TabContainerDirective } from './layout/layout-container.directive';
import { ContentDirective } from './layout/layout-content.directive';
import { SidebarDirective } from './layout/layout-sidebar.directive';
import { LinkDirective } from './link/link.directive';
import { ListItemComponent } from './list/list-item/list-item.component';
import { ListComponent } from './list/list.component';
import { MenuComponent } from './menu/menu.component';
import { NavItemComponent } from './nav/nav-item/nav-item.component';
import { NavComponent } from './nav/nav.component';
import { PrismComponent } from './prism/prism.component';
import { ProjectNavComponent } from './project-nav/project-nav.component';
import { ThreeViewerComponent } from './three/viewer/viewer.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { TooltipDirective } from './tooltip/tooltip.directive';
import { TreeItemComponent } from './tree/tree-item/tree-item.component';
import { TreeComponent } from './tree/tree.component';

@NgModule({
  declarations: [
    LinkDirective,
    ProjectNavComponent,
    TooltipComponent,
    TooltipDirective,
    NavComponent,
    NavItemComponent,
    FormFieldComponent,
    LabelDirective,
    InputComponent,
    CardComponent,
    CardTitleComponent,
    CardContentComponent,
    CardActionComponent,
    CheckboxComponent,
    MenuComponent,
    ButtonComponent,
    ToggleButtonDirective,
    ListComponent,
    ListItemComponent,
    FormFieldActionsDirective,
    BreadcrumbsComponent,
    BreadcrumbComponent,
    DialogComponent,
    DialogOutletDirective,
    TreeComponent,
    TreeItemComponent,
    PrismComponent,
    ThreeViewerComponent,
    DragbarDirective,
    SidebarDirective,
    TabContainerDirective,
    ContentDirective,
  ],
  exports: [
    // 3rd Party UI Modules.
    FontAwesomeModule,
    // UI Modules.
    FormsModule,
    ReactiveFormsModule,
    LinkDirective,
    ProjectNavComponent,
    TooltipComponent,
    TooltipDirective,
    NavComponent,
    NavItemComponent,
    FormFieldComponent,
    LabelDirective,
    InputComponent,
    CardComponent,
    CardTitleComponent,
    CardContentComponent,
    CardActionComponent,
    CheckboxComponent,
    MenuComponent,
    ButtonComponent,
    ToggleButtonDirective,
    ListComponent,
    ListItemComponent,
    FormFieldActionsDirective,
    BreadcrumbsComponent,
    BreadcrumbComponent,
    DialogComponent,
    TreeComponent,
    TreeItemComponent,
    PrismComponent,
    ThreeViewerComponent,
    DragbarDirective,
    SidebarDirective,
    TabContainerDirective,
    ContentDirective,
  ],
  imports: [CommonModule, FontAwesomeModule, RouterModule, FormsModule, OverlayModule, DialogModule],
})
export class UiModule {}
