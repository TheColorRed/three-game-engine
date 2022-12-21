import { Component } from '@angular/core';
import { faFolderOpen } from '@fortawesome/sharp-solid-svg-icons';
import { filter, tap } from 'rxjs';
import { ElectronService } from '../../../services/electron.service';
import { ProjectsService } from '../../../services/projects.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  browseFolderIcon = faFolderOpen;

  home = '';
  home$ = this.projects.saveLocation$.pipe(
    tap(i => this.settings.set('default-save-location', i)),
    tap(i => (this.home = i))
  );

  constructor(
    private readonly settings: SettingsService,
    private readonly projects: ProjectsService,
    private readonly electron: ElectronService
  ) {}

  updatePath() {
    this.settings.set('default-save-location', this.home);
  }

  selectFolder() {
    this.electron
      .selectFolder()
      .pipe(
        filter(i => i.length > 0),
        tap(i => this.settings.set('default-save-location', i)),
        tap(i => (this.home = i))
      )
      .subscribe();
  }
}
