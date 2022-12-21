import { NgModule } from '@angular/core';
import { FileContentPipe } from './file-content.pipe';
import { GetModuleCategoryPipe } from './get-module-category.pipe';

@NgModule({
  exports: [FileContentPipe, GetModuleCategoryPipe],
  declarations: [FileContentPipe, GetModuleCategoryPipe],
})
export class PipesModule {}
