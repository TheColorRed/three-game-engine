import { GameObjectRef, Once } from '@engine/common';
import { Sprite } from '@engine/core';
import { Prefab } from '@engine/objects';
import bullet from '../sprites/ballBlue.png';

@Prefab({
  name: 'Bullet',
  object: new Sprite(bullet)
})
export class Bullet {

  constructor(
    // private readonly scene: SceneService
    private readonly gameObject: GameObjectRef
  ) { }

  @Once(3)
  once() {
    this.gameObject.destroy();
  }
}