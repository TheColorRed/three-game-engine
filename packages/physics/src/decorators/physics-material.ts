import { Newable } from '@engine/core';
import { PHYSICS_MATERIAL } from '../tokens';

export interface PhysicsMaterialOptions {
  bounciness?: number;
  friction?: number;
}

export function PhysicsMaterial(options?: PhysicsMaterialOptions) {
  return (target: Newable<object>) => {
    Reflect.defineMetadata(PHYSICS_MATERIAL, options, target);
  };
}