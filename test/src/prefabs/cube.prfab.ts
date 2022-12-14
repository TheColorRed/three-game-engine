import { GameObject, Three } from '@engine/core';


@GameObject({
  object: () => {
    const geometry = new Three.BoxGeometry(1, 1, 1);
    const material = new Three.MeshBasicMaterial({ color: 0x00ff00 });
    return new Three.Mesh(geometry, material);
  }
})
export class Cube { }