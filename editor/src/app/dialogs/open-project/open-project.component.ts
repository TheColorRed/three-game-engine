import { Component } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { ProjectObj } from '../../pages/welcome/projects/projects.component';
import { ProjectsService } from '../../services/projects.service';
import { DialogComponent, DialogResultData } from '../../ui/dialog/dialog.component';

@Component({
  selector: 'app-open-project',
  templateUrl: './open-project.component.html',
  styleUrls: ['./open-project.component.scss'],
})
export class OpenProjectComponent implements DialogResultData<string> {
  projects$ = this.projects.projects$.pipe(
    switchMap(i => this.projects.currentProject$.pipe(map(p => i.filter(o => o.path !== p))))
  );

  data = '';

  constructor(private readonly projects: ProjectsService, private readonly dialog: DialogComponent) {}

  openProject(proj: ProjectObj) {
    this.data = proj.path;
    this.dialog.close();
  }
}
