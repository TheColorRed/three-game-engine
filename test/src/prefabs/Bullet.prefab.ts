import { GameObjectRef, Once, Prefab, Sprite, Time, Vector2 } from '@engine/core';
import { Transform } from '@engine/objects';
import bullet from '../sprites/ballBlue.png';

@Prefab({
  name: 'Bullet',
  object: new Sprite(bullet)
})
export class Bullet {

  endPoint = Vector2.up;

  constructor(
    private readonly gameObject: GameObjectRef,
    private readonly transform: Transform,
    private readonly time: Time
  ) { }

  @Once(3)
  once() {
    this.gameObject.destroy();
  }

  onUpdate() {
    this.transform.moveTowards(this.endPoint, this.time.delta * 30);
    // this.transform.translate(this.direction, this.time.delta * 30);
  }
}