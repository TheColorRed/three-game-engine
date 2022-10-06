import { Vector2, Vector3 } from '@engine/core';
import { PHYSICS_RIGIDBODY } from '../tokens';

export type RigidbodyShape = { type: 'sphere', radius: number; } |
{ type: 'cube', size: { width: number, height: number, depth: number; }; } |
{ type: 'convex'; } |
{ type: 'concave'; } |
{ type: 'none'; } |
{ type: 'cone', size: { radius: number; height: number; }; } |
{ type: 'capsule', size: { radius: number; height: number; }; };

export type RigidbodyShape2D = { type: 'circle', radius: number; } |
{ type: 'box', size: { width: number, height: number; }; } |
{ type: 'none'; } |
// { type: 'polygon', size: { radius: number; height: number; }; } |
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

export interface RigidbodyOptions2D extends RigidbodyGlobalOptions {
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
  angularLock: Vector2;
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
      twoDimensional: true,
      linearLock: new Vector3(options?.angularLock?.x ?? 1, options?.angularLock?.y ?? 1, 0),
      angularLock: new Vector3(0, 0, options?.angularLock?.z ?? 1)
    });
    Reflect.defineMetadata(PHYSICS_RIGIDBODY, options, target);
  };
}