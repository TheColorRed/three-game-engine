import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { faCog, faHandWave, faPenRuler, faStore, faToolbox } from '@fortawesome/sharp-solid-svg-icons';
import { filter, map, merge, of, tap } from 'rxjs';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  welcomeIcon = faHandWave;
  projectsIcon = faToolbox;
  projectIcon = faPenRuler;
  storeIcon = faStore;
  editorSettingsIcon = faCog;

  breadcrumb = '';

  currentProject$ = this.projects.currentProject$;
  routeChanged$ = merge(of('load'), this.router.events).pipe(
    filter(i => i instanceof NavigationEnd || i === 'load'),
    map(() => this.active.firstChild?.routeConfig?.data ?? { breadcrumb: { label: '' } }),
    tap(i => (this.breadcrumb = i['breadcrumb']['label']))
  );

  constructor(
    private readonly router: Router,
    private readonly active: ActivatedRoute,
    private readonly projects: ProjectsService
  ) {}
}
