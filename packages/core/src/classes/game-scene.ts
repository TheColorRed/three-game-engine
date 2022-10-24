import { first, tap, timer } from 'rxjs';
import { Debug } from '../debug';
import { GameModule } from '../decorators/module';
import { SceneOptions } from '../decorators/scene';
import { Injector } from '../di/injector';
import { Newable, Type } from '../di/types';
import { CameraManager } from '../services/camera-manager.service';
import { GameModuleService } from '../services/game-module.service';
import { GameObjectManager } from '../services/game-object-manager.service';
import { SceneManager } from '../services/scene-manager.service';
import { Source } from '../source/source';
import { Three } from '../three';
import { Euler } from '../transforms/euler';
import { Vector3 } from '../transforms/vector';
import { GameCamera } from './game-camera';
import { GameObject } from './game-object';

export abstract class GameScene<T extends object = object> {
  /** @internal */
  registeredGameObjects: Newable<GameObject>[];
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
  sceneManager = Injector.get(SceneManager)!;
  cameraManager = Injector.get(CameraManager)!;
  gameObjectManager: GameObjectManager;
  moduleService = Injector.get(GameModuleService)!;

  constructor(target: Newable<T>, options?: SceneOptions) {
    this.instance = Injector.create(target).get(target)!;
    this.gameObjectManager = Injector.get(GameObjectManager)!;
    this.registeredGameObjects = options?.hierarchy ?? [];
    this.registeredCameras = options?.cameras ?? [];
    this.isActive = true;
    this.sceneManager.scenes.push(this);
    this.#initializeGameObjects().subscribe();
  }

  #initializeGameObjects() {
    return timer(100, 0).pipe(
      first(() => Array.from(Source.sources.values()).every(i => i.loaded === true)),
      tap(() => {
        Debug.log('Loading Game Objects...');
        this.#loadGameObjects(this.registeredGameObjects ?? []);
      })
    );
  }

  #loadGameObjects(item: Newable<GameObject | GameModule> | Newable<GameObject>[] = []) {
    if (Array.isArray(item)) {
      for (let i of item) this.#loadGameObjects(i);
    } else if (GameObjectManager.isNewableGameObject(item)) {
      this.sceneManager.instantiate(item, { scene: this });
    } else if (CameraManager.isNewableGameCamera(item)) {
      this.cameraManager.instantiate(item);
    } else if (GameModule.isNewableGameModule(item)) {
      this.#instantiateGameModule(item);
    }
  }

  instantiate(object: Newable<GameObject>, position?: Vector3, rotation?: Euler) {
    this.sceneManager.instantiate(object, { position, rotation, scene: this });
  }

  #instantiateGameModule(object: Newable<GameModule>) {
    this.moduleService.initModule(object, this).subscribe();
  }

  addThreeObject(gameObject?: Three.Object3D) {
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