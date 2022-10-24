import { GameCamera } from '../classes/game-camera';
import { GameObject } from '../classes/game-object';
import { GameScene } from '../classes/game-scene';
import { Injectable } from '../di/injectable';
import { Newable } from '../di/types';
import { Three } from '../three';
import { Euler } from '../transforms/euler';
import { Vector3 } from '../transforms/vector';
import { CameraManager } from './camera-manager.service';
import { GameObjectManager } from './game-object-manager.service';

export interface GameObjectInitOptions {
  /** The position of where to create the object. */
  position?: Vector3;
  /** The rotation of the newly created object. */
  rotation?: Euler;
  /** The scene to add the object to. Defaults to the active scene. */
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
    private readonly cameraManager: CameraManager,
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
   * @param options
   */
  instantiate<T>(object: Newable<any>, options?: GameObjectInitOptions): T {
    let item: GameObject | GameCamera;
    if (GameObjectManager.isNewableGameObject(object)) {
      item = this.#createGameObject(object, options);
    } else {
      item = this.#createCamera(object, options);
    }
    return item as T;
  }

  #createGameObject(object: Newable<GameObject>, options?: GameObjectInitOptions) {
    const item = this.gameObjectManager.instantiate(object);

    // Set the position and rotation if provided. Otherwise use the defaults.
    if (options?.position) item.position = options.position;
    if (options?.rotation) item.rotation = options.rotation;

    // Add the item to the three.js world
    if (options?.scene) options.scene.addThreeObject(item.object3d);
    else this.activeScene?.addThreeObject(item.object3d);

    return item;
  }

  #createCamera(object: Newable<GameCamera>, options?: GameObjectInitOptions) {
    const item = this.cameraManager.instantiate(object);

    if (item.isMainCamera) {
      if (typeof this.camera.main !== 'undefined' && item.isMainCamera === true) {
        throw new Error('A game can only have one main camera.');
      }

      if (typeof this.camera.main === 'undefined') {
        this.camera.main = item;
        // this.camera.activeCamera = item;
        this.camera.setActiveCamera(item);
      }
    }

    return item;
  }
}