import { Component } from '@angular/core';
import { faBuildings, faCubes, faEdit, faFileExport, faScribble } from '@fortawesome/sharp-solid-svg-icons';

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss'],
})
export class ProjectSettingsComponent {
  authoringIcon = faEdit;
  brandingIcon = faBuildings;
  modulesIcon = faCubes;
  renderingIcon = faScribble;
  exportIcon = faFileExport;
}
