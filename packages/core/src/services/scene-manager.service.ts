import { GameObject, GameScene } from '../classes';
import { Injectable, Type } from '../di';
import { Three } from '../three';
import { Euler, Vector3 } from '../transforms';
import { CameraManager } from './camera-manager.service';
import { GameObjectManager } from './game-object-manager.service';

/**
 * The scene service is a singleton service that manges the game scenes.
 *
 *
 */
@Injectable({ providedIn: 'game' })
export class SceneManager {
  /**
   * The root scene of the game; all other objects and scenes will be children.
   * @internal
   */
  readonly rootScene = new Three.Scene();
  /**
   * The debug scene for showing debugging objects.
   * @internal
   */
  debugScene?: Three.Scene;
  /** The scene that is currently active. */
  activeScene?: GameScene;
  /** A list of game scene instances. */
  scenes: GameScene[] = [];

  constructor(
    private readonly gameObjectManager: GameObjectManager,
    private readonly camera: CameraManager,
  ) { }
  /**
   * Makes a scene enabled and optionally disables the others.
   * @param scene The scene to enable.
   * @param disableAll Whether or not to disable all the other scenes.
   */
  setActiveScene(scene: GameScene, disableAll = false) {
    disableAll && this.scenes.forEach(s => s.isActive = false);
    scene.isActive = true;
  }
  /**
   * Adds a three.js game object to the scene.
   * @internal
   */
  add(item: Three.Object3D) {
    this.activeScene?.addGameObject(item);
  }
  /**
   * Creates a game object in the current scene.
   * @param object The game object to instantiate.
   * @param position The position of the newly created object.
   * @param rotation The rotation of the newly created object.
   */
  instantiate<T>(object: Type<T>, position?: Vector3, rotation?: Euler): T {
    const item = this.gameObjectManager.instantiate(object) as GameObject;
    if (CameraManager.isCamera(item) && item.isMainCamera) {
      if (typeof this.camera.main === 'undefined') {
        this.camera.main = item;
        this.camera.activeCamera = item;
      }
    }
    if (position) item.position = position;
    if (rotation) item.rotation = rotation;
    item.object3d && this.add(item.object3d);
    return item as T;
  }
}