import { GameObjectBase } from './classes/game-object';
import { Injector } from './di/injector';
import { GameConfig } from './services/game-config.service';
import { SceneManager } from './services/scene-manager.service';
import { Three } from './three';

export class Debug {

  static config = Injector.get(GameConfig)!;
  static scene = Injector.get(SceneManager)!;

  static log(...message: any[]) {
    const isProduction = this.config.get('production') ?? true;
    if (isProduction === false) {
      console.log(...message);
    }
  }

  static getName(value: any) {
    if (value instanceof GameObjectBase) {
      return value.instance.constructor.name;
    }
  }

  static drawBox(x: number, y: number, width: number, height: number) {
    const material = new Three.LineBasicMaterial({ color: 0x00ff00 });

    const points = [
      new Three.Vector3(x, y, 0),
      new Three.Vector3(x + width, y, 0),
      new Three.Vector3(x + width, y - height, 0),
      new Three.Vector3(x, y - height, 0),
      new Three.Vector3(x, y, 0)
    ];

    const geometry = new Three.BufferGeometry().setFromPoints(points);
    const box = new Three.Line(geometry, material);

    this.scene.debugScene?.add(box);
    return box;
  }
}