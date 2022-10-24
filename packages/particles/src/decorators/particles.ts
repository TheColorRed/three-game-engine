import { Curve, GameObjectOptions, Newable, Range, Resource, Vector3 } from '@engine/core';
import { Particles } from '../particles/particles';


export interface ParticleSystemOptions extends GameObjectOptions {
  texture: string;
  /** The time in seconds that the system should emit; otherwise run forever. */
  duration?: number;
  resource?: Resource;
  subSystems?: Newable<object>[];
  prewarm?: boolean;
  /** The lifetime each particle should live for. */
  lifetime?: number | Range;

  // startColor?: string;
  // /** The particles starting color. */
  // startSpeed?: number | Range;
  // /** The particles starting speed. */
  // startSize?: number | Range;
  // /** The particles starting rotation. */
  // startRotation?: number | Range;

  colorOverLifetime?: Curve;
  /** The speed of the particle as it ages. */
  speedOverLifetime?: [Curve?, Curve?, Curve?] | [Vector3, Vector3] | Curve | Vector3;
  /** The size of the particle as it ages. */
  sizeOverLifetime?: [number, number] | Curve | number;
  /** The rotation of the particle as it ages. */
  rotationOverLifetime?: Curve;
}

export function ParticleSystem(options: ParticleSystemOptions) {
  return (target: any) => {
    return class ParticleSystemComponent extends Particles {
      constructor() {
        super(target, options);
      }
    };
  };
}