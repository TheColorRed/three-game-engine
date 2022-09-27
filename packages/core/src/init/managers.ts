import { Injector } from '../di';
import { CameraManager, GameObjectManager, SceneManager } from '../services';

export class Managers {

  camera: CameraManager;
  scene: SceneManager;
  gameObject: GameObjectManager;

  constructor() {
    this.camera = Injector.create(CameraManager).get(CameraManager)!;
    this.scene = Injector.create(SceneManager).get(SceneManager)!;
    this.gameObject = Injector.create(GameObjectManager).get(GameObjectManager)!;
  }
}