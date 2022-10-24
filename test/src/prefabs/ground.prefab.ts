import { GameObjectRef, Prefab, Sprite, Vector3 } from '@engine/core';
import { Transform } from '@engine/objects';
import { Rigidbody2D, Rigidbody2DRef } from '@engine/physics2d';
import ground from '../sprites/paddleRed.png';

@Prefab({
  name: 'Ground',
  object: new Sprite(ground),
  position: new Vector3(0, -10, 0),
})
@Rigidbody2D({
  isStatic: true,
  shape: { type: 'box', size: { width: 100, height: 1 } }
})
export class Ground {

  constructor(
    public readonly transform: Transform,
    public readonly gameObject: GameObjectRef,
    public readonly rigidbody: Rigidbody2DRef<'box'>
  ) { }

}