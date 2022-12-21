import { Component, EventEmitter, Output } from '@angular/core';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
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
  @Output() openMenu = new EventEmitter<void>();
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
  helpIcon = faQuestionCircle;
}
