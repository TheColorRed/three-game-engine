import { GameObjectRef, Prefab, Sprite, Vector3 } from '@engine/core';
import { Transform } from '@engine/objects';
import { Rigidbody2D, RigidbodyRef } from '@engine/physics';
import ground from '../sprites/paddleRed.png';

@Prefab({
  name: 'Ground',
  object: new Sprite(ground),
  position: new Vector3(0, -10, 0)
})
@Rigidbody2D({ mass: 0, shape: { type: 'box', size: { width: 100, height: 1 } } })
export class Ground {

  constructor(
    public readonly transform: Transform,
    public readonly gameObject: GameObjectRef,
    public readonly rigidbody: RigidbodyRef<'box'>
  ) { }

}