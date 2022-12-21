import { Component, DoCheck } from '@angular/core';
import { faFolderOpen } from '@fortawesome/sharp-solid-svg-icons';
import * as path from 'path';
import { BehaviorSubject, debounceTime, filter, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ElectronService } from '../../services/electron.service';
import { FileSystemService } from '../../services/fs.service';
import { ProjectsService } from '../../services/projects.service';
import { DialogComponent, DialogResultData } from '../../ui/dialog/dialog.component';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss'],
})
export class NewProjectComponent implements DoCheck, DialogResultData<{ path: string; title: string }> {
  openFolderIcon = faFolderOpen;

  projectTitle = '';
  projectLocation = '';
  fsExists = false;
  projectExists = false;

  private doChecks = new BehaviorSubject<string>('');

  sep$ = this.electron.separator$;
  location$ = this.projects.saveLocation$.pipe(tap(i => (this.projectLocation = i)));
  doChecks$ = this.doChecks.pipe(
    filter(i => i.length > 0),
    debounceTime(100),
    tap(i => (this.projectExists = this.projects.exists(i))),
    switchMap(i => this.fs.exists(path.join(i, environment.manifest)).pipe(tap(i => (this.fsExists = i))))
  );

  get data() {
    return { path: this.fullPath, title: this.projectTitle };
  }

  get fullPath() {
    return path.join(this.projectLocation, this.projectTitle);
  }

  constructor(
    private readonly projects: ProjectsService,
    private readonly electron: ElectronService,
    private readonly dialogRef: DialogComponent<any>,
    private readonly fs: FileSystemService
  ) {}

  ngDoCheck() {
    this.dialogRef.valid = !this.projectExists && !this.fsExists && !!this.projectTitle && !!this.projectLocation;
  }

  projectCheck() {
    this.doChecks.next(this.fullPath);
  }

  openFolder() {
    this.electron
      .selectFolder()
      .pipe(
        filter(i => i.length > 0),
        tap(i => (this.projectLocation = i))
      )
      .subscribe();
  }
}
