import { Engine, Euler, Injectable, Three, Type, Vector3 } from '@engine/core';
import { GameObject } from '..';

/**
 * The scene service is a singleton service that manges the game scenes.
 *
 *
 */
@Injectable({ providedIn: 'game' })
export class Scene {

  scene: Three.Scene;

  /** List of instantiated game scenes. */
  get scenes() {
    return Engine.gameScenes;
  }

  constructor() {
    this.scene = new Three.Scene();
    this.scene.background = new Three.Color('#000');
  }
  /**
   * Adds a three.js game object to the scene.
   * @internal
   */
  add(item: Three.Object3D) {
    this.scene.add(item);
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
    return item as T;
  }
}