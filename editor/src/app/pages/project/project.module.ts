import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UiModule } from '../../ui/ui.module';
import { ProjectComponent } from './project.component';

@NgModule({
  declarations: [ProjectComponent],
  imports: [
    CommonModule,
    UiModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProjectComponent,
        loadChildren: () => import('../project-settings/project-settings.module').then(m => m.ProjectSettingsModule),
      },
    ]),
  ],
})
export class ProjectModule {}
