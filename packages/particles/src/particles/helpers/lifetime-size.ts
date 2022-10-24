import { Curve, Line, Random } from '@engine/core';
import { Particle, Particles } from '../particles';

export function setLifetimeSize(this: Particles): Curve {
  // x = time
  // y = value
  const lifetime = this.options.sizeOverLifetime;
  if (typeof lifetime === 'number') {
    return Line.horizontal(0, lifetime, 1);
  }
  // else if (this.isCurveArray(lifetime)) {
  //   const [x, y, z] = lifetime;
  //   return [
  //     x instanceof Curve ? x : Line.horizontal(0, 0, 1),
  //     y instanceof Curve ? y : Line.horizontal(0, 0, 1),
  //     z instanceof Curve ? z : Line.horizontal(0, 0, 1),
  //   ];
  // }
  else if (this.isNumberArray(lifetime)) {
    // if (lifetime.length === 6) {
    //   return [
    //     Line.create(0, Random.range(lifetime[0], lifetime[1]), 1, Random.range(lifetime[0], lifetime[1])),
    //     Line.create(0, Random.range(lifetime[2], lifetime[3]), 1, Random.range(lifetime[2], lifetime[3])),
    //     Line.create(0, Random.range(lifetime[4], lifetime[5]), 1, Random.range(lifetime[4], lifetime[5]))
    //   ];
    // } else {
    return Line.create(0, Random.range(lifetime[0], lifetime[1]), 1, Random.range(lifetime[0], lifetime[1]));
    // }
  } else if (lifetime instanceof Curve) {
    return lifetime;
  }
  return Line.horizontal(0, 1, 1);
}

export function getLifetimeSize(this: Particles, particle: Particle, time: number) {
  if (!particle.lifetime?.size) return 1;
  return particle.lifetime.size.lerp(time).y;
  // if (!this.options.sizeOverLifetime) return particle.currentSize;
  // const lifetime = this.options.sizeOverLifetime;
  // if (lifetime instanceof Curve) {
  //   return lifetime.lerp(time).y;
  // }
  // return particle.currentSize;
}