import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { faClose, faFolderOpen, faHome, faPowerOff } from '@fortawesome/sharp-solid-svg-icons';
import { filter, tap } from 'rxjs';
import { OpenProjectComponent } from '../../dialogs/open-project/open-project.component';
import { ProjectsService } from '../../services/projects.service';
import { DialogService } from '../dialog/dialog.service';

@Component({
  selector: 'ui-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [DialogService],
})
export class MenuComponent {
  @Output() close = new EventEmitter<void>();
  closeIcon = faClose;
  homeIcon = faHome;
  closeProjectIcon = faPowerOff;
  openProjectIcon = faFolderOpen;

  constructor(
    public readonly elementRef: ElementRef<HTMLElement>,
    private readonly dialog: DialogService,
    private readonly projects: ProjectsService,
    private readonly router: Router
  ) {}
  /**
   * Emits to the parent that the model should be closed.
   */
  onClose() {
    this.close.emit();
  }
  /**
   * Closes the project that is currently open.
   */
  closeProject() {
    this.projects.close();
    this.router.navigateByUrl('/welcome');
  }
  /**
   * Show a dialog that shows a list of projects that can be opened.
   */
  openProjectDialog() {
    const ref = this.dialog.open(OpenProjectComponent, { width: 500 });
    ref.accepted$
      .pipe(
        filter((i): i is string => typeof i === 'string'),
        tap(i => this.projects.open(i))
      )
      .subscribe();
  }
}
