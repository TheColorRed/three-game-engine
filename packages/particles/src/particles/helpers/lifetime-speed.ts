import { Curve, Line, Random, Vector2, Vector3 } from '@engine/core';
import { Particle, Particles } from '../particles';

export function setLifetimeSpeed(this: Particles): Curve | [Curve, Curve, Curve] {
  // x = time
  // y = value
  const lifetime = this.options.speedOverLifetime;
  if (lifetime instanceof Vector3) {
    return [
      new Line(Vector2.zero.addY(lifetime.x), Vector2.zero.addX(1).addY(lifetime.x)),
      new Line(Vector2.zero.addY(lifetime.y), Vector2.zero.addX(1).addY(lifetime.y)),
      new Line(Vector2.zero.addY(lifetime.z), Vector2.zero.addX(1).addY(lifetime.z)),
    ];
  } else if (this.isVectorArray(lifetime)) {
    const [first, second] = lifetime;
    return [
      new Line(Vector2.zero.addY(Random.range(first.x, second.x)), Vector2.zero.addX(1).addY(Random.range(first.x, second.x))),
      new Line(Vector2.zero.addY(Random.range(first.y, second.y)), Vector2.zero.addX(1).addY(Random.range(first.y, second.y))),
      new Line(Vector2.zero.addY(Random.range(first.z, second.z)), Vector2.zero.addX(1).addY(Random.range(first.z, second.z))),
    ];
  } else if (this.isCurveArray(lifetime)) {
    const [x, y, z] = lifetime;
    return [
      x instanceof Curve ? x : Line.horizontal(0, 0, 1),
      y instanceof Curve ? y : Line.horizontal(0, 0, 1),
      z instanceof Curve ? z : Line.horizontal(0, 0, 1),
    ];
  } else if (lifetime instanceof Curve) {
    return lifetime;
  }
  return Line.horizontal(0, 0, 1);
}

export function getLifetimeSpeed(this: Particles, particle: Particle, time: number) {
  if (!particle.lifetime?.speed) return Vector3.up;
  const lifetime = particle.lifetime.speed;
  if (this.isCurveArray(lifetime)) {
    const [x, y, z] = lifetime;
    const lx = x?.lerp(time).y ?? 0;
    const ly = y?.lerp(time).y ?? 0;
    const lz = z?.lerp(time).y ?? 0;
    return new Vector3(lx, ly, lz);
  } else if (lifetime instanceof Curve) {
    return lifetime.lerp(time) as unknown as Vector3;
  }
  return particle.currentSpeed;
}