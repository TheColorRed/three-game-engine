import { Engine, Injectable, Three, Type, Vector3 } from '@engine/core';
import { GameObject } from '../game-object';

@Injectable({ providedIn: 'game' })
export class Scene {

  scene: Three.Scene;

  constructor() {
    this.scene = new Three.Scene();
    this.scene.background = new Three.Color('#000');
  }

  add(item: Three.Object3D) {
    this.scene.add(item);
  }

  instantiate<T>(object: Type<T>, position = Vector3.zero): T {
    const item = Engine.instantiate(object) as GameObject;
    item.position = position;
    return item as T;
  }
}