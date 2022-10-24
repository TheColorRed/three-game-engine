import { Debug, GameConfig, GameObjectRef, Injectable, Injector, OnDestroy, Three, Vector2 } from '@engine/core';
import { GameLoop } from '@engine/core/src/services/game-loop.service';
import { Subscription } from 'rxjs';
import { auditTime, tap } from 'rxjs/operators';
import { RigidbodyOptions2D, RigidbodyShape2D } from '../decorators/rigidbody2d';
import { PHYSICS2D_RIGIDBODY } from '../tokens/rigidbody-tokens';
import { World2D } from './world2d.service';

export type Shapes2D = RigidbodyShape2D['type'];

@Injectable()
export class Rigidbody2DRef<T extends Shapes2D> implements OnDestroy {
  private debugObject?: Three.Object3D;

  private readonly config = Injector.get(GameConfig)!;
  private readonly gameLoop = Injector.get(GameLoop)!;
  private gizmoSub?: Subscription;

  loop$ = this.gameLoop.updated$
    .pipe(
      auditTime(1 / 60),
      tap(() => this.drawGizmo())
    );

  get options(): { shape: Extract<RigidbodyShape2D, { type: T; }>; } & RigidbodyOptions2D {
    const ctr = this.gameObject.reference.instance.constructor;
    return Reflect.getMetadata(PHYSICS2D_RIGIDBODY, ctr);
  }

  constructor(
    private readonly gameObject: GameObjectRef,
    private readonly world: World2D
  ) {
    if (this.config.get('production') === false && this.config.isPhysicsGizmos) {
      this.gizmoSub = this.loop$.subscribe();
    }
  }

  onDestroy() {
    this.gizmoSub?.unsubscribe();
  }
  /**
   * Applies force to the game object.
   * @param force The amount of force to apply to on each axis.
   */
  applyForce(force: Vector2) {
    this.world.applyForce(this.gameObject.reference, force);
  }
  /**
   * Applies a sudden impulse to the game object.
   * @param force The amount of force to apply to on each axis.
   */
  applyImpulse(force: Vector2) {
    this.world.applyImpulse(this.gameObject.reference, force);
  }
  /**
   * Applies a rotation amount on one or more axises over time.
   * @param force
   */
  applyTorque(force: number) {
    this.world.applyTorque(this.gameObject.reference, force);
  }
  /**
   * Applies a sudden impulse rotation amount on one or more axises.
   * @param force
   */
  applyTorqueImpulse(force: number) {
    this.world.applyTorqueImpulse(this.gameObject.reference, force);
  }
  /**
   * Sets the velocity for the game object.
   * @param velocity The velocity to set on each axis.
   */
  setVelocity(velocity: Vector2) {
    this.world.setVelocity(this.gameObject.reference, velocity);
  }
  /**
   * Sets the angular velocity for the game object.
   * @param velocity The angular velocity to set on each axis.
   */
  setAngularVelocity(velocity: number) {
    this.world.setAngularVelocity(this.gameObject.reference, velocity);
  }

  drawGizmo() {
    if (this.debugObject) return;
    if (this.options.shape.type === 'box') {
      this.drawBox();
    }
  }

  private drawBox() {
    const go = this.gameObject.reference;
    if (
      go.object3d &&
      'size' in this.options.shape &&
      'width' in this.options.shape.size &&
      'height' in this.options.shape.size
    ) {
      this.debugObject = Debug.drawBox(
        (this.options.shape.size.width / 2) - this.options.shape.size.width,
        this.options.shape.size.height / 2,
        this.options.shape.size.width,
        this.options.shape.size.height
      );
      this.gameObject.reference.object3d?.add(this.debugObject);
    }
  }
}