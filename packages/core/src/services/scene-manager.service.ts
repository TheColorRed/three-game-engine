import { GameObject, GameScene } from '../classes';
import { Injectable, Newable } from '../di';
import { Three } from '../three';
import { Euler, Vector3 } from '../transforms';
import { CameraManager } from './camera-manager.service';
import { GameObjectManager } from './game-object-manager.service';

export interface GameObjectInitOptions {
  position?: Vector3;
  rotation?: Euler;
  scene?: GameScene;
}

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
   * Creates a game object in the current scene.
   * @param object The game object to instantiate.
   * @param position The position of the newly created object.
   * @param rotation The rotation of the newly created object.
   */
  instantiate(object: Newable<GameObject>, options?: GameObjectInitOptions) {
    const item = this.gameObjectManager.instantiate(object);
    if (CameraManager.isCamera(item) && item.isMainCamera) {
      if (typeof this.camera.main === 'undefined') {
        this.camera.main = item;
        this.camera.activeCamera = item;
      }
    }

    // Set the position and rotation if needed.
    if (options?.position) item.position = options.position;
    if (options?.rotation) item.rotation = options.rotation;

    // Add the item to the three.js world
    if (options?.scene) options.scene.addThreeObject(item.object3d);
    else this.activeScene?.addThreeObject(item.object3d);

    return item;
  }
}