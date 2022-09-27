import { Vector3 } from '@engine/core';
import { PHYSICS_RIGIDBODY } from '../tokens';

export type RigidbodyShape = { type: 'sphere', radius: number; } |
{ type: 'cube', size: { width: number, height: number, depth: number; }; } |
{ type: 'convex'; } |
{ type: 'concave'; } |
{ type: 'none'; } |
{ type: 'cone', size: { radius: number; height: number; }; } |
{ type: 'capsule', size: { radius: number; height: number; }; };

export interface RigidbodyOptions {
  /** The weight of the rigidbody. */
  mass: number;
  /** The shape of the collider attached to the rigidbody. */
  shape: RigidbodyShape;
  /** The physics material associated with this rigidbody. */
  material: object;
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

export function Rigidbody(options?: Partial<RigidbodyOptions>) {
  return function (target: any) {
    Reflect.defineMetadata(PHYSICS_RIGIDBODY, options, target);
  };
}