import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormFieldComponent } from './form-field/form-field.component';
import { InputDirective } from './form/input.directive';
import { LabelDirective } from './label/label.directive';
import { LinkDirective } from './link/link.directive';
import { NavItemComponent } from './nav/nav-item/nav-item.component';
import { NavComponent } from './nav/nav.component';
import { ProjectNavComponent } from './project-nav/project-nav.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { TooltipDirective } from './tooltip/tooltip.directive';

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
    InputDirective,
  ],
  exports: [
    FlexLayoutModule,
    FontAwesomeModule,
    LinkDirective,
    ProjectNavComponent,
    NavComponent,
    NavItemComponent,
    FormFieldComponent,
    LabelDirective,
    InputDirective,
  ],
  imports: [CommonModule, FlexLayoutModule, FontAwesomeModule, RouterModule],
})
export class UiModule {}
