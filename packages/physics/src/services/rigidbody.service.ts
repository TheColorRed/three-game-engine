import { GameObjectRef, Injectable, OnStart, Vector3 } from '@engine/core';
import { RigidbodyOptions, RigidbodyShape } from '../decorators';
import { PHYSICS_RIGIDBODY } from '../tokens';
import { World } from '../world';

export type Shapes = RigidbodyShape['type'];

@Injectable()
export class RigidbodyRef<T extends Shapes> implements OnStart {

  options!: { shape: Extract<RigidbodyShape, { type: T; }>; } & RigidbodyOptions;

  constructor(
    private readonly gameObject: GameObjectRef,
    private readonly world: World
  ) { }

  onStart() {
    this.options = Reflect.getMetadata(PHYSICS_RIGIDBODY, this.gameObject.toType());
  }
  /**
   * Applies force to the game object.
   * @param force The amount of force to apply to on each axis.
   */
  applyForce(force: Vector3) {
    this.world.applyForce(this.gameObject.reference, force);
  }
  /**
   * Applies a sudden impulse to the game object.
   * @param force The amount of force to apply to on each axis.
   */
  applyImpulse(force: Vector3) {
    this.world.applyImpulse(this.gameObject.reference, force);
  }
  /**
   * Sets the velocity for the game object.
   * @param velocity The velocity to set on each axis.
   */
  setVelocity(velocity: Vector3) {
    this.world.setVelocity(this.gameObject.reference, velocity);
  }

  /**
   * Sets the angular velocity for the game object.
   * @param velocity The angular velocity to set on each axis.
   */
  setAngularVelocity(velocity: Vector3) {
    this.world.setAngularVelocity(this.gameObject.reference, velocity);
  }

  drawGizmo() {

    // debugDrawer = new AmmoDebugDrawer(null, debugVertices, debugColors, physicsWorld);
    // debugDrawer.enable();
  }

}