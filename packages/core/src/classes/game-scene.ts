import { SceneHierarchy, SceneOptions } from '../decorators';
import { Injector, Newable, Type } from '../di';
import { SceneManager } from '../services';
import { Three } from '../three';
import { GameCamera } from './game-camera';

export abstract class GameScene<T extends object = object> {
  /** @internal */
  registeredGameObjects: SceneHierarchy;
  /** @internal */
  registeredCameras: Type<GameCamera>[];
  /** @internal */
  scene = new Three.Scene();
  /** Whether or not the scene is active. */
  isActive = false;
  /**
   * The instance of the targeted scene.
   * @internal
   */
  instance: T;
  sceneManager: SceneManager;

  constructor(target: Newable<T>, options?: SceneOptions) {
    this.instance = Injector.create(target).get(target)!;
    this.registeredGameObjects = options?.hierarchy || [];
    this.registeredCameras = options?.cameras || [];
    this.isActive = true;
    this.sceneManager = Injector.get(SceneManager) as SceneManager;
    this.sceneManager.scenes.push(this);
  }

  addGameObject(gameObject?: Three.Object3D | Three.Sprite) {
    if (typeof gameObject === 'undefined') return;
    if (gameObject instanceof Three.Sprite) {
      if (gameObject) return this.scene.add(gameObject);
      return;
    }
    return this.scene.add(gameObject);
  }
  /**
   * Activates the scene and deactivates the others.
   */
  setActive() {
    this.sceneManager.scenes.forEach(cam => cam.isActive = false);
    this.isActive = true;
  }

  setParent(gameObject: Three.Object3D, parentObject: Three.Object3D) {
    if (typeof gameObject === 'undefined' || typeof parentObject === 'undefined') return;
    parentObject.add(gameObject);
  }
}