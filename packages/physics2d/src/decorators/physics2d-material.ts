import { Newable } from '@engine/core';
import { PHYSICS2D_MATERIAL } from '../tokens';

export interface Physics2DMaterialOptions {
  bounciness?: number;
  friction?: number;
}

export function PhysicsMaterial2D(options?: Physics2DMaterialOptions) {
  return (target: Newable<object>) => {
    Reflect.defineMetadata(PHYSICS2D_MATERIAL, options, target);
  };
}