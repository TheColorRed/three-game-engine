import { Component } from '@angular/core';
import {
  faAlien8bit,
  faBars,
  faClapperboard,
  faFiles,
  faGameBoardSimple,
  faPlay,
  faSave,
  faSliders,
  faSparkles,
  faWaveformLines,
} from '@fortawesome/sharp-solid-svg-icons';

@Component({
  selector: 'ui-project-nav',
  templateUrl: './project-nav.component.html',
  styleUrls: ['./project-nav.component.scss'],
})
export class ProjectNavComponent {
  menuIcon = faBars;
  saveIcon = faSave;
  resourcesIcon = faFiles;
  runIcon = faPlay;
  projectIcon = faSliders;
  gameObjectsIcon = faAlien8bit;
  texturesIcon = faGameBoardSimple;
  fxIcon = faSparkles;
  soundsIcon = faWaveformLines;
  scenesIcon = faClapperboard;
}
