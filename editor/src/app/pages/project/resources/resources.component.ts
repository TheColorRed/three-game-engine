import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faClapperboard,
  faCube,
  faFileLines,
  faFolder,
  faFolderOpen,
  faImage,
  faMinus,
  faMusic,
  faPlus,
} from '@fortawesome/sharp-solid-svg-icons';
import * as path from 'path';
import { BehaviorSubject, concatMap, filter, finalize, map, pipe, tap } from 'rxjs';
import { File } from '../../../classes/file';
import { ElectronService } from '../../../services/electron.service';
import { FileSystemService } from '../../../services/fs.service';
import { ProjectService } from '../../../services/project.service';
import { StringService } from '../../../services/string.service';
import { DragbarResizeService } from '../../../ui/layout/dragbar/dragbar.component';

export type FilterType = 'models' | 'images' | 'documents' | 'audio' | 'video';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
})
export class ResourcesComponent {
  addIcon = faPlus;
  removeIcon = faMinus;
  modelIcon = faCube;
  imageIcon = faImage;
  textIcon = faFileLines;
  audioIcon = faMusic;
  videoIcon = faClapperboard;
  folderIcon = faFolder;
  folderOpenIcon = faFolderOpen;

  showSidebar = true;

  readonly fileTreeRoot = this.project.resources();

  readonly WATCH_CHANNEL = 'files:watch:all';

  filters = new Map<FilterType, boolean>([
    ['models', false],
    ['documents', false],
    ['images', false],
    ['audio', false],
  ]);
  query = '';

  watcher = this.fs.watch(this.WATCH_CHANNEL, path.join(this.project.path(), 'resources'));
  files$ = this.watcher.files$.pipe(
    // Get the file from the paths.
    map(paths => {
      const entries = Array.from(paths.entries());
      return entries.map(([, file]) => file);
    }),
    // Filter the query string.
    map(files =>
      files.reduce<File[]>((acc, val) => {
        if (this.query.length === 0) return acc.concat(val);
        if (this.string.fuzzyMatch(this.query, val.name)) return acc.concat(val);
        return acc;
      }, [])
    ),
    // Filter the the toggled items.
    map(files =>
      files.reduce<File[]>((acc, val) => {
        const active = Array.from(this.filters.entries())
          .filter(([key, val]) => val === true)
          .map(([key]) => key);
        if (active.length === 0) return acc.concat(val);
        if (active.includes('documents') && val.isText) return acc.concat(val);
        if (active.includes('models') && val.isModel) return acc.concat(val);
        if (active.includes('images') && val.isImage) return acc.concat(val);
        if (active.includes('audio') && val.isAudio) return acc.concat(val);
        return acc;
      }, [])
    ),
    finalize(() => this.watcher?.close())
  );

  private fileContent = new BehaviorSubject<File | undefined>(undefined);
  fileContent$ = this.fileContent.pipe(filter((path): path is File => path instanceof File));

  fileParams$ = this.route.queryParams.pipe(
    filter(params => typeof params['file'] !== 'undefined'),
    tap(params => this.fileContent.next(new File(params['file'])))
  );

  resize$ = this.dragResize.elements$.pipe(tap(() => (this.showSidebar = true)));
  dblclick$ = this.dragResize.dblclick$.pipe(tap(() => (this.showSidebar = !this.showSidebar)));

  constructor(
    private readonly electron: ElectronService,
    private readonly fs: FileSystemService,
    private readonly project: ProjectService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly string: StringService,
    private readonly dragResize: DragbarResizeService
  ) {}

  addItem() {
    this.electron.selectFile({ multi: true }).pipe(this.#copyFiles()).subscribe();
  }

  removeItem(evt: MouseEvent, item: File) {
    evt.stopPropagation();
    this.fs.delete(item.path).subscribe();
  }

  open(file: File) {
    this.router.navigate([], { queryParams: { file: file.path } });
  }

  copyFiles(files: File[]) {}

  filterType(toggled: boolean, type: FilterType) {
    this.filters.set(type, toggled);
    this.watcher.ping();
  }

  filterText(query: string) {
    this.query = query;
    this.watcher.ping();
  }

  #copyFiles() {
    return pipe(
      filter((i: File[]): i is File[] => i.length > 0),
      concatMap(i => i),
      tap(file => this.fs.copy(file.path, this.project.resources(), true)),
      tap(console.log)
    );
  }
}
