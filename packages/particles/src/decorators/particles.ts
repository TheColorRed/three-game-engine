import { Color, Curve, GameObjectOptions, Gradient, Newable, Rand, Range, Resource, Space, Vector3 } from '@engine/core';
import { MaterialBlend, Particles } from '../particles/particles';

export type ParticleSystemShape =
  { type: 'cone'; angle: number; radius: number; emitFrom: 'base' | 'volume'; } |
  { type: 'sphere'; radius: number; } |
  { type: 'box'; scale: Vector3; emitFrom: 'volume' | 'edge'; };

export interface ParticleSystemOptions extends GameObjectOptions {
  /** The texture to use for the particle system. */
  texture?: string;
  /** How to blend the particles defaults to `Normal`. */
  blending?: MaterialBlend;
  /** The shape of the particle system emitter. */
  shape?: ParticleSystemShape;
  /** The time in seconds that the system should emit */
  duration?: number;
  /** Whether or not the particle system should start over once the `duration` has been reached. */
  looping?: boolean;
  resource?: Resource;
  /** A child particle system for each particle. */
  subSystems?: Newable<object>[];
  prewarm?: boolean;
  /** Only generates particles once. */
  static?: boolean;
  /**
   * The location to spawn particles.
   * * `local` &ndash; Creates the particles on the game object; when the object moves so do the particles.
   * * `global` &ndash; Creates the particles on the game root; when the object moves the particles don't.
   */
  space?: Space;
  /** The maximum number of particles that can be active on the particle system at one time. */
  maxParticles?: number;
  /** Settings that apply to an individual particle. */
  particle?: {
    /** The lifetime each particle should live for. */
    lifetime?: number | Range;
    /** Describes how the particle system emits particles. */
    emission?: {
      /** The number of particles that should be generated within the particle systems `duration`. */
      rateOverTime?: number;
    };
    /** Describes the particles size. */
    size?: {
      /** The size of the particle as it ages. */
      sizeOverLifetime?: [number, number] | Curve[] | Rand<Curve | number | Curve[] | number[]> | Curve | number;
    };
    /** Describes the particles rotation. */
    rotation?: {
      /** The rotation of the particle as it ages. */
      rotationOverLifetime?: Curve;
    };
    /** Describes the particles color. */
    color?: {
      /** The color of the particle as it ages. */
      colorOverLifetime?: Gradient | Color | Gradient[] | Color[];
    };
    /** Describes the particles speed. */
    speed?: {
      /** The speed of the particle as it ages. */
      speedOverLifetime?: Rand<[Curve?, Curve?, Curve?]> | [Curve?, Curve?, Curve?] | [Vector3, Vector3] | Curve | Vector3;
    };
  };
}

export function ParticleSystem(options: ParticleSystemOptions) {
  return function (target: any): any {
    return class ParticleSystemComponent extends Particles {
      constructor() {
        super(target, options);
      }
    };
  };
}