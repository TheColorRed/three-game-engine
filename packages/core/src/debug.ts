// import { Engine } from './engine';
import { Three } from './three';

export class Debug {
  static log(...message: any[]) {
    // if (Engine.production === false) {
    //   console.log(...message);
    // }
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
    // Engine.sceneManager.activeScene?.addGameObject(box);
  }
}