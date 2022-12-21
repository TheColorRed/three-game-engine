import { Component } from '@angular/core';
import { Manifest, ProjectService } from '../../../../services/project.service';

@Component({
  selector: 'app-authoring',
  templateUrl: './authoring.component.html',
  styleUrls: ['./authoring.component.scss'],
})
export class AuthoringComponent {
  manifest$ = this.project.manifest$;

  constructor(private readonly project: ProjectService) {}

  inputChanged(manifest: Manifest) {
    this.project.updateManifest(manifest);
  }
}
