import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../../../pipes/pipes.module';
import { UiModule } from '../../../ui/ui.module';
import { DropzoneDirective } from './dropzone.directive';
import { ResourcesComponent } from './resources.component';

@NgModule({
  declarations: [ResourcesComponent, DropzoneDirective],
  imports: [
    CommonModule,
    UiModule,
    PipesModule,
    RouterModule.forChild([
      {
        path: '',
        component: ResourcesComponent,
      },
    ]),
  ],
})
export class ResourcesModule {}
