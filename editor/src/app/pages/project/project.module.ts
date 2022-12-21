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
        children: [
          {
            path: 'settings',
            loadChildren: () => import('./settings/project-settings.module').then(m => m.ProjectSettingsModule),
          },
          {
            path: 'resources',
            loadChildren: () => import('./resources/resources.module').then(m => m.ResourcesModule),
          },
          {
            path: 'scenes',
            loadChildren: () => import('./scenes/scenes.module').then(m => m.ScenesModule),
          },
        ],
      },
    ]),
  ],
})
export class ProjectModule {}
