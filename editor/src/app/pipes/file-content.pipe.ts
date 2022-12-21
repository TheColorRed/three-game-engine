import { Pipe, PipeTransform } from '@angular/core';
import { File } from '../classes/file';

@Pipe({
  name: 'fileContent',
})
export class FileContentPipe implements PipeTransform {
  transform(value: File) {
    return value.content();
  }
}
