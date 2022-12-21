import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UiModule } from '../../../ui/ui.module';
import { ScenesComponent } from './scenes.component';
import { AddSceneComponent } from './add-scene/add-scene.component';

@NgModule({
  declarations: [ScenesComponent, AddSceneComponent],
  imports: [
    CommonModule,
    UiModule,
    RouterModule.forChild([
      {
        path: '',
        component: ScenesComponent,
      },
    ]),
  ],
})
export class ScenesModule {}
