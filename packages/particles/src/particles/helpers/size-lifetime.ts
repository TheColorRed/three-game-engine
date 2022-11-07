import { Curve, Line, Random, WeightedRandom } from '@engine/core';
import { Particle, Particles } from '../particles';

export function setLifetimeSize(this: Particles): Curve {
  // x = time
  // y = value
  const lifetime = this.options.particle?.size?.sizeOverLifetime;
  if (typeof lifetime === 'number') {
    return Line.horizontal(0, lifetime, 1);
  }
  else if (this.isCurveArray(lifetime)) {
    return lifetime[Math.floor(Math.random() * lifetime.length)];
  }
  else if (this.isNumberArray(lifetime)) {
    return Line.create(0, Random.range(lifetime[0], lifetime[1]), 1, Random.range(lifetime[0], lifetime[1]));
  }
  else if (lifetime instanceof WeightedRandom) {
    const v = lifetime.random();
    if (typeof v === 'number') {
      return Line.horizontal(0, v, 1);
    } else if (this.isNumberArray(v)) {
      return Line.create(0, Random.range(v[0], v[1]), 1, Random.range(v[0], v[1]));
    } else if (this.isCurveArray(v)) {
      return v[Math.floor(Math.random() * v.length)];
    }
    return v;
  }
  else if (lifetime instanceof Curve) {
    return lifetime;
  }
  return Line.horizontal(0, 1, 1);
}

export function getLifetimeSize(this: Particles, particle: Particle, time: number) {
  if (!particle.lifetime?.size) return 1;
  return particle.lifetime.size.lerp(time).y;
}

function getCurve() {

}