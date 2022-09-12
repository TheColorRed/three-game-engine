import { Engine, Injectable, Type, Vector3 } from '@engine/core';
import { Color, Object3D, Scene as ThreeScene } from 'three';
import { GameObject } from '../game-object';

@Injectable({ providedIn: 'root' })
export class Scene {

  scene: ThreeScene;

  constructor() {
    this.scene = new ThreeScene();
    this.scene.background = new Color('#000');
  }

  add(item: Object3D) {
    this.scene.add(item);
  }

  instantiate<T>(object: Type<T>, position = Vector3.zero) {
    const item = Engine.instantiate(object) as GameObject;
    item.position = position;
    return item;
  }
}