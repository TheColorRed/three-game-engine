import { Engine, Three, Type } from '@engine/core';
import { GameCamera, SceneHierarchy, SceneOptions } from '@engine/objects';

export abstract class GameScene<T = object> {
  /** @internal */
  registeredGameObjects: SceneHierarchy;
  /** @internal */
  registeredCameras: Type<GameCamera>[];
  /** @internal */
  scene = new Three.Scene();
  isActive = false;
  // addGameObject(gameObject?: Three.Object3D | Sprite | Spacial): Three.Scene | undefined;

  constructor(target: new () => T, options?: SceneOptions) {
    this.registeredGameObjects = options?.hierarchy || [];
    this.registeredCameras = options?.cameras || [];
    this.scene;
    this.isActive = false;
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
    Engine.gameScenes.forEach(cam => cam.isActive = false);
    this.isActive = true;
  }

  setParent(gameObject: Three.Object3D, parentObject: Three.Object3D) {
    if (typeof gameObject === 'undefined' || typeof parentObject === 'undefined') return;
    parentObject.add(gameObject);
  }
}