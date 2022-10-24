import { Vector3 } from '@engine/core';
import { ParticleSystem } from '@engine/particles';
import fire from '../../sprites/fire.png';
import smoke from '../../sprites/smoke.png';

@ParticleSystem({
  texture: smoke
})
export class Smoke { }

@ParticleSystem({
  // resource: new Sprite(ball),
  texture: fire,
  // duration: 0.15,
  // sizeOverLifetime: QuadraticBezierCurve.arch(Vector2.zero, new Vector2(10, 0.5)),
  sizeOverLifetime: [1, 2],
  lifetime: 3,// new Range(1, 2),
  // sizeOverLifetime: Curve.arch(0, 2, 0, 1),
  speedOverLifetime: [Vector3.zero.sub(1), Vector3.zero.add(2)],
  // speedOverLifetime: [undefined, Curve.sCurve(0, 0, 4, -2), undefined],
  subSystems: [Smoke]
})
export class Fire { }