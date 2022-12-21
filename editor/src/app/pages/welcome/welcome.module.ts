import { DialogModule } from '@angular/cdk/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DialogsModule } from '../../dialogs/dialogs.module';
import { UiModule } from '../../ui/ui.module';
import { ProjectsComponent } from './projects/projects.component';
import { SettingsComponent } from './settings/settings.component';
import { WelcomeComponent } from './welcome.component';

@NgModule({
  declarations: [WelcomeComponent, ProjectsComponent, SettingsComponent],
  imports: [
    CommonModule,
    UiModule,
    FormsModule,
    DialogModule,
    OverlayModule,
    DialogsModule,
    RouterModule.forChild([
      {
        path: '',
        component: WelcomeComponent,
        children: [
          { path: 'projects', component: ProjectsComponent, data: { breadcrumb: { label: 'Projects' } } },
          { path: 'settings', component: SettingsComponent, data: { breadcrumb: { label: 'Settings' } } },
        ],
      },
    ]),
  ],
})
export class WelcomeModule {}
