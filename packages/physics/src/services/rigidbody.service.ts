import { GameConfig, GameObjectRef, Injectable, Injector, OnStart, Three, Vector3 } from '@engine/core';
import { GameLoop } from '@engine/core/src/services/game-loop.service';
import { auditTime, tap } from 'rxjs';
import { RigidbodyOptions, RigidbodyShape } from '../decorators';
import { PHYSICS_RIGIDBODY } from '../tokens';
import { World } from './world.service';

export type Shapes = RigidbodyShape['type'];

@Injectable()
export class RigidbodyRef<T extends Shapes> implements OnStart {

  private readonly config = Injector.get(GameConfig)!;
  private readonly gameLoop = Injector.get(GameLoop)!;
  private debugObject?: Three.Object3D;

  loop$ = this.gameLoop.updated$
    .pipe(
      auditTime(1 / 60),
      tap(() => this.drawGizmo())
    );

  get options(): { shape: Extract<RigidbodyShape, { type: T; }>; } & RigidbodyOptions {
    const ctr = this.gameObject.reference.instance.constructor;
    return Reflect.getMetadata(PHYSICS_RIGIDBODY, ctr);
  }

  constructor(
    private readonly gameObject: GameObjectRef,
    private readonly world: World
  ) {
    if (this.config.get('production') === false && this.config.isPhysicsGizmos) {
      this.loop$.subscribe();
    }
  }
  onStart(): void {
    throw new Error('Method not implemented.');
  }

  // onStart() {
  //   console.log('onStart');
  //   this.options =
  // }
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
   * Applies a rotation amount on one or more axises over time.
   * @param force
   */
  applyTorque(force: Vector3) {
    this.world.applyTorque(this.gameObject.reference, force);
  }
  /**
   * Applies a sudden impulse rotation amount on one or more axises.
   * @param force
   */
  applyTorqueImpulse(force: Vector3) {
    this.world.applyTorqueImpulse(this.gameObject.reference, force);
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
    if (this.debugObject) return;
  }

}