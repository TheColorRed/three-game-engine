import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faFilePlus, faPlusLarge, faTrash } from '@fortawesome/sharp-solid-svg-icons';
import * as path from 'path';
import { concat, concatMap, filter, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NewProjectComponent } from '../../../dialogs/new-project/new-project.component';
import { ElectronService } from '../../../services/electron.service';
import { FileSystemService } from '../../../services/fs.service';
import { Manifest } from '../../../services/project.service';
import { ProjectsService } from '../../../services/projects.service';
import { DialogService } from '../../../ui/dialog/dialog.service';

export type ProjectObj = { path: string; name: string };

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  providers: [DialogService],
})
export class ProjectsComponent {
  addProjectIcon = faFilePlus;
  newProjectIcon = faPlusLarge;
  deleteProjectIcon = faTrash;

  projects$ = this.projects.projects$
    .pipe
    // map(i => Array.from(i)),
    // map(i => i.reduce<ProjectObj[]>((acc, val) => acc.concat({ path: val[0], name: val[1] }), []))
    ();

  constructor(
    private readonly electron: ElectronService,
    private readonly projects: ProjectsService,
    private readonly dialog: DialogService,
    private readonly router: Router,
    private readonly fs: FileSystemService
  ) {}
  /**
   * Adds a project to the application to be tracked.
   */
  addProject() {
    this.electron
      .selectFolder()
      .pipe(
        filter(i => i.length > 0),
        map(i => ({ name: path.basename(new URL(i).pathname), path: i })),
        tap(i => this.projects.add(i.name, i.path))
      )
      .subscribe();
  }
  /**
   * Opens a dialog to display the new project wizard.
   */
  newProject() {
    const newProj = this.dialog.open(NewProjectComponent, {
      width: '50%',
      disableClose: true,
      actions: { confirm: 'Create', reject: 'Cancel' },
    });

    newProj.accepted$
      .pipe(
        filter(i => typeof i !== 'undefined'),
        tap(i => this.projects.add(i.title, i.path)),
        concatMap(i =>
          concat(
            this.fs.mkdirp(i.path),
            this.fs.writeJson<Manifest>(
              path.join(i.path, environment.manifest),
              {
                name: i.title,
                developer: '',
                homepage: '',
                version: '1.0.0',
              },
              true
            )
          )
        )
      )
      .subscribe();
  }
  /**
   * Opens an existing project.
   */
  openProject(proj: ProjectObj) {
    this.projects.open(proj.path);
    this.router.navigateByUrl('/project/settings');
  }
  /**
   * Deletes a project from the project list.
   * @param proj The project to delete.
   * @param event The mouse event.
   */
  deleteProject(proj: ProjectObj, event: MouseEvent) {
    event.stopPropagation();
    path && this.projects.remove(proj.path);
  }
}
