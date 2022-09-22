import { GameObjectRef } from '@engine/common';
import { Debug, OnStart, Sprite, Transform, Vector3 } from '@engine/core';
import { Prefab } from '@engine/objects';
import { Rigidbody, RigidbodyRef } from '@engine/physics';
import ground from '../sprites/paddleRed.png';

@Prefab({
  name: 'Ground',
  object: new Sprite(ground),
  position: new Vector3(-10, -10, -1)
})
@Rigidbody({ mass: 0, shape: { type: 'cube', size: { width: 100, height: 1, depth: 100 } } })
export class Ground implements OnStart {

  constructor(
    public readonly transform: Transform,
    public readonly gameObject: GameObjectRef,
    public readonly rigidbody: RigidbodyRef<'cube'>
  ) { }

  onStart(): void {
    Debug.drawBox(
      this.transform.position.x,
      this.transform.position.y,
      this.rigidbody.options.shape.size.width,
      this.rigidbody.options.shape.size.height
    );
  }
}