import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiModule } from '../ui/ui.module';
import { NewProjectComponent } from './new-project/new-project.component';
import { OpenProjectComponent } from './open-project/open-project.component';

@NgModule({
  declarations: [NewProjectComponent, OpenProjectComponent],
  // exports: [NewProjectComponent, OpenProjectComponent],
  imports: [CommonModule, FormsModule, UiModule],
})
export class DialogsModule {}
