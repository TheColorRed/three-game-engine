import { Curve, Line, Random, Vector, Vector2, Vector3 } from '@engine/core';
import { Particle, Particles } from '../particles';

export function setLifetimeSpeed(this: Particles): Curve | [Curve, Curve, Curve] {
  // x = time
  // y = value
  const lifetime = this.options.particle?.speed?.speedOverLifetime;
  if (lifetime instanceof Vector3) {
    return [
      new Line(Vector2.zero.addY(lifetime.x), Vector2.zero.addX(1).addY(lifetime.x)),
      new Line(Vector2.zero.addY(lifetime.y), Vector2.zero.addX(1).addY(lifetime.y)),
      new Line(Vector2.zero.addY(lifetime.z), Vector2.zero.addX(1).addY(lifetime.z)),
    ];
  } else if (this.isVectorArray(lifetime)) {
    const [first, second] = lifetime;
    const rx1 = Random.rangeFloat(first.x, second.x), ry1 = Random.rangeFloat(first.y, second.y), rz1 = Random.rangeFloat(first.z, second.z);
    const rx2 = Random.rangeFloat(first.x, second.x), ry2 = Random.rangeFloat(first.y, second.y), rz2 = Random.rangeFloat(first.z, second.z);
    // console.log(rx1, rx2);
    return [
      Line.create(0, rx1, 1, rx2),
      Line.create(0, ry1, 1, ry2),
      Line.create(0, rz1, 1, rz2)
      // new Line(Vector2.zero.addX(first.x).addY(rx1), Vector2.zero.addX(first.x + 1).addY(rx2)),
      // new Line(Vector2.zero.addX(first.y).addY(ry1), Vector2.zero.addX(first.y + 1).addY(ry2)),
      // new Line(Vector2.zero.addX(first.z).addY(rz1), Vector2.zero.addX(first.z + 1).addY(rz2)),
    ];
  } else if (this.isCurveArray(lifetime) && lifetime.length <= 3) {
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
  // x = time
  // y = value
  if (!particle.lifetime?.speed) return Vector3.up;
  const lifetime = particle.lifetime.speed;
  const space = this.space;
  const obj = this.object3d.position;
  if (this.isCurveArray(lifetime)) {
    const [x, y, z] = lifetime;
    const lx = x?.lerp(time).y ?? 0;
    const ly = y?.lerp(time).y ?? 0;
    const lz = z?.lerp(time).y ?? 0;
    return new Vector3(lx, ly, lz);
  } else if (lifetime instanceof Curve) {
    const v = lifetime.lerp(time) as Vector as Vector3;
    return new Vector3(v.y, v.y, v.y);
  }
  return particle.currentSpeed;
}