import { Vector3 } from '@engine/core';
import { PHYSICS_RIGIDBODY } from '../tokens';

export type RigidbodyShape = { type: 'sphere', radius: number; } |
{ type: 'cube', size: { width: number, height: number, depth: number; }; } |
{ type: 'convex'; } |
{ type: 'concave'; } |
{ type: 'none'; } |
{ type: 'cone', size: { radius: number; height: number; }; } |
{ type: 'capsule', size: { radius: number; height: number; }; };

export interface RigidbodyGlobalOptions {
  /** @internal */
  twoDimensional: boolean;
  /** The weight of the rigidbody. */
  mass: number;
  /** The physics material associated with this rigidbody. */
  material: object;
  /**
   * The amount of time after the rigidbody stops moving before it is deactivated.
   * Once another force interacts with the rigidbody the process repeats.
   * * Numbers closer to zero stay active longer.
   * * Numbers further from zero deactivate sooner.
   * * A value of zero means the rigidbody never sleeps (this could have performance implications).
   */
  sleepThreshold: number;
}

export interface RigidbodyOptions extends RigidbodyGlobalOptions {
  /** The shape of the collider attached to the rigidbody. */
  shape: RigidbodyShape;
  /** The local gravity for the rigidbody. */
  gravity: Vector3;
  /**
   * Locks the rigidbody to particular a axis.
   * @example
   * { linearLock: new Vector3(0, 1, 0) } // Only allows movement along the y axis
   */
  linearLock: Vector3;
  /**
   * Locks the rigidbody to particular a axis.
   * @example
   * { angularLock: new Vector3(0, 1, 0) } // Only allows rotation on the y axis
   */
  angularLock: Vector3;
}

/**
 * Creates a rigidbody that works in three dimensional space.
 * @param options Options that describe how the rigidbody should work.
 */
export function Rigidbody(options?: Partial<RigidbodyOptions>) {
  return function (target: any) {
    options = Object.assign<{}, Partial<RigidbodyOptions>>({}, {
      ...options,
      twoDimensional: false
    });
    Reflect.defineMetadata(PHYSICS_RIGIDBODY, options, target);
  };
}