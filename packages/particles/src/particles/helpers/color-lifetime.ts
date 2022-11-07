import { Color, Gradient, Random } from '@engine/core';
import { Particle, Particles } from '../particles';

export function setLifetimeColor(this: Particles): Gradient {
  const lifetime = this.options.particle?.color?.colorOverLifetime;
  if (lifetime instanceof Gradient) {
    return lifetime;
  } else if (lifetime instanceof Color) {
    return Gradient.create(lifetime, lifetime);
  } else if (Array.isArray(lifetime)) {
    const r = Random.range(0, lifetime.length - 1);
    const itm = lifetime[r];
    if (itm instanceof Gradient) return itm;
    return Gradient.create(itm, itm);
  }
  return Gradient.create(Color.white, Color.black);
}
export function getLifetimeColor(this: Particles, particle: Particle, time: number): Color {
  if (!particle.lifetime?.color) return Color.white;
  return particle.lifetime.color.lerp(time);
}