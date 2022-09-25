import { Engine, Euler, Injectable, Three, Type, Vector3 } from '@engine/core';
import { GameObject, GameScene } from '@engine/objects';

/**
 * The scene service is a singleton service that manges the game scenes.
 *
 *
 */
@Injectable({ providedIn: 'game' })
export class SceneManager {
  /** The scene that is currently active. */
  activeScene?: GameScene;
  /** List of instantiated game scenes. */
  get scenes() { return Engine.gameScenes; }

  constructor() {
    // this.activeScene = new Three.Scene();
    // this.activeScene.background = new Three.Color('#000');
  }
  setActiveScene(scene: GameScene) {
    this.scenes.forEach(s => s.isActive = false);
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
   * @returns
   */
  instantiate<T>(object: Type<T>, position = Vector3.zero, rotation = Euler.zero): T {
    const item = Engine.instantiate(object) as GameObject;
    item.position = position;
    item.rotation = rotation;
    item.object3d && this.add(item.object3d);
    return item as T;
  }
}