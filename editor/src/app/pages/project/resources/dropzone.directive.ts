import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
import { File } from '../../../classes/file';

@Directive({
  selector: '[dropzone]',
})
export class DropzoneDirective {
  @Output() files = new EventEmitter<File[]>();

  @HostBinding('class')
  get dropzoneClass() {
    return {
      dropzone: true,
    };
  }

  @HostListener('dragover', ['$event'])
  onDragover(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  @HostListener('dragleave', ['$event'])
  onDragleave(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    const data = Object.values(e.dataTransfer?.files ?? {});
    const files = data.map(file => new File(file.path));
    this.files.emit(files);
  }
}
