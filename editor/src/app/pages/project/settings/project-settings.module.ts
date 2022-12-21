import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../../../pipes/pipes.module';
import { UiModule } from '../../../ui/ui.module';
import { AuthoringComponent } from './authoring/authoring.component';
import { BrandingComponent } from './branding/branding.component';
import { ExportComponent } from './export/export.component';
import { ModulesComponent } from './modules/modules.component';
import { ProjectSettingsComponent } from './project-settings.component';
import { RenderingComponent } from './rendering/rendering.component';

@NgModule({
  declarations: [
    ProjectSettingsComponent,
    AuthoringComponent,
    BrandingComponent,
    ModulesComponent,
    RenderingComponent,
    ExportComponent,
  ],
  imports: [
    CommonModule,
    UiModule,
    FormsModule,
    PipesModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProjectSettingsComponent,
        children: [
          { path: '', redirectTo: 'authoring', pathMatch: 'full' },
          { path: 'authoring', component: AuthoringComponent },
          { path: 'branding', component: BrandingComponent },
          { path: 'modules', component: ModulesComponent },
          { path: 'rendering', component: RenderingComponent },
          { path: 'export', component: ExportComponent },
        ],
      },
    ]),
  ],
})
export class ProjectSettingsModule {}
