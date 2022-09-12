import { OrthographicCamera as OrthoCamera } from 'three';
import { GameCamera } from './camera';

export class OrthographicCamera extends OrthoCamera implements GameCamera {

  fov = 60;

  constructor() {
    super();
  }

  get isActive(): boolean { return false; }// Engine.activeCamera === this; };

  setActive() {
    // Engine.activeCamera = this;
  }
}