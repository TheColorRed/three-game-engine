import { PHYSICS_RIGIDBODY } from '@engine/physics';

export type RigidbodyShape = { type: 'sphere', radius: number; } |
{ type: 'cube', size: { width: number, height: number, depth: number; }; } |
{ type: 'convex'; } |
{ type: 'concave'; } |
{ type: 'none'; } |
{ type: 'cone', size: { radius: number; height: number; }; } |
{ type: 'capsule', size: { radius: number; height: number; }; };

export interface RigidbodyOptions {
  mass: number;
  shape: RigidbodyShape;
}

export function Rigidbody(options?: Partial<RigidbodyOptions>) {
  return function (target: any) {
    const newOptions = {
      ...options,
      mass: options?.mass ?? 1
    };
    Reflect.defineMetadata(PHYSICS_RIGIDBODY, newOptions, target);
  };
}