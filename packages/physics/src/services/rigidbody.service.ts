import { GameObjectRef } from '@engine/common';
import { Injectable, OnStart, PHYSICS_RIGIDBODY } from '@engine/core';
import type { RigidbodyOptions, RigidbodyShape } from '@engine/physics';

export type Shapes = RigidbodyShape['type'];

@Injectable()
export class RigidbodyRef<T extends Shapes> implements OnStart {

  options!: { shape: Extract<RigidbodyShape, { type: T; }>; } & RigidbodyOptions;

  constructor(
    private readonly gameObject: GameObjectRef
  ) { }

  onStart() {
    this.options = Reflect.getMetadata(PHYSICS_RIGIDBODY, this.gameObject.toType());
  }

  drawGizmo() {

    // debugDrawer = new AmmoDebugDrawer(null, debugVertices, debugColors, physicsWorld);
    // debugDrawer.enable();
  }

}