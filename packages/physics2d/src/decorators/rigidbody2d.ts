import { Newable, Vector2 } from '@engine/core';
import { PHYSICS2D_RIGIDBODY } from '../tokens/rigidbody-tokens';

export type RigidbodyShape2D = { type: 'circle', radius: number; } |
{ type: 'box', size: { width: number, height: number; }; } |
{ type: 'none'; } |
// { type: 'polygon', size: { radius: number; height: number; }; } |
{ type: 'capsule', size: { width: number; height: number; }; };

export interface RigidbodyOptions2D {
  /** The weight of the rigidbody. */
  mass: number;
  /** The physics material associated with this rigidbody. */
  material: Newable<object>;
  /**
   * The amount of time after the rigidbody stops moving before it is deactivated.
   * Once another force interacts with the rigidbody the process repeats.
   * * Numbers closer to zero stay active longer.
   * * Numbers further from zero deactivate sooner.
   * * A value of zero means the rigidbody never sleeps (this could have performance implications).
   */
  sleepThreshold: number;
  /** The shape of the collider attached to the rigidbody. */
  shape: RigidbodyShape2D;
  /** The local gravity for the rigidbody. */
  gravity: Vector2;
  /**
   * Locks the rigidbody to particular a axis.
   * @example
   * { linearLock: new Vector3(0, 1, 0) } // Only allows movement along the y axis
   */
  linearLock: Vector2;
  /**
   * Locks the rigidbody to particular a axis.
   * @example
   * { angularLock: new Vector3(0, 1, 0) } // Only allows rotation on the y axis
   */
  angularLock: boolean;
  isStatic: boolean;
  isSensor: boolean;
}

/**
 * Creates a rigidbody that works in two dimensional space.
 * * Automatically sets the `z` `linearLock` to `0`.
 * * Automatically sets the `x, y` `angularLock` to `0`.
 * @param options Options that describe how the rigidbody should work.
 */
export function Rigidbody2D(options?: Partial<RigidbodyOptions2D>) {
  return function (target: any) {
    options = Object.assign<{}, Partial<RigidbodyOptions2D>>({}, {
      ...options,
      linearLock: new Vector2(options?.linearLock?.x ?? 1, options?.linearLock?.y ?? 1),
      angularLock: options?.angularLock ?? false
    });
    Reflect.defineMetadata(PHYSICS2D_RIGIDBODY, options, target);
  };
}