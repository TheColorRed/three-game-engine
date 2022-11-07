import { GameObject, GameObjectRef, OnStart, Random, Sprite, Time, Vector2 } from '@engine/core';
import { Transform } from '@engine/objects';
import { Rigidbody2D, Rigidbody2DRef } from '@engine/physics2d';
import bullet from '../sprites/ballBlue.png';

@GameObject({
  name: 'Bullet',
  object: new Sprite(bullet)
})
@Rigidbody2D({ shape: { type: 'circle', radius: 1 } })
export class Bullet implements OnStart {

  endPoint = Vector2.up;

  constructor(
    private readonly gameObject: GameObjectRef,
    private readonly transform: Transform,
    private readonly time: Time,
    private readonly rigidbody: Rigidbody2DRef<'circle'>
  ) { }

  onStart(): void {
    const impulse = new Vector2(Random.range(-10, 10), Random.range(-10, 10));
    this.rigidbody.applyImpulse(impulse);
    this.gameObject.destroy(3);
  }
}