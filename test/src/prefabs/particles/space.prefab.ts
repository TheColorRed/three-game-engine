import { Color, Curve, GameObjectRef, Gradient, Line, Once, OnUpdate, Range, Time, WeightedRandom } from '@engine/core';
import { Transform } from '@engine/objects';
import { MaterialBlend, ParticleSystem } from '@engine/particles';
import { MoveComponent } from '../../components/move.component';
// import fire from '../../sprites/fire.png';

@ParticleSystem({
  // static: true
  // texture: fire,
  // components: [MoveComponent],
  // shape: { type: 'box', scale: new Vector3(1, 0, 0), emitFrom: 'volume' },
  shape: { type: 'sphere', radius: 3, emitFrom: 'volume' },
  maxParticles: 1000,
  duration: 1,
  // space: WorldSpace.World,
  blending: MaterialBlend.Add,
  particle: {
    lifetime: new Range(1, 1.5),
    speed: { speedOverLifetime: [, Line.horizontal(0, 2)] },
    size: {
      // sizeOverLifetime: new Random('123')
      sizeOverLifetime: new WeightedRandom<Curve>()
        .add(3, Curve.arch(1, 1, 3))
        .add(10, Line.angled(0, 1, 0))
        .add(10, Curve.arch(1, 1, 0.5))
    },
    // size: { sizeOverLifetime: [Curve.arch(0, 1, 3), Curve.arch(0, 1, 1), Curve.arch(0, 1, 0.5)] },
    color: {
      colorOverLifetime: [
        new Gradient(
          [
            Gradient.color(0, Color.white),
            Gradient.color(0.45, Color.yellow),
            Gradient.color(0.5, Color.orange),
            Gradient.color(1, Color.red),
          ],
          [Gradient.alpha(0, 0), Gradient.alpha(0.45, 1), Gradient.alpha(0.75, 1), Gradient.alpha(1, 0)]
        ),
        new Gradient(
          [
            Gradient.color(0, Color.yellow),
            Gradient.color(0.05, Color.orange),
            Gradient.color(1, Color.red),
          ],
          [Gradient.alpha(0, 0), Gradient.alpha(0.45, 1), Gradient.alpha(0.75, 1), Gradient.alpha(1, 0)]
        )
      ]
    },
    emission: { rateOverTime: 80 }
  }
})
export class Space implements OnUpdate {

  constructor(
    private readonly transform: Transform,
    private readonly time: Time,
    private readonly ref: GameObjectRef,
  ) { }

  @Once(0)
  delayed() {
    console.log('delayed');
    console.log(this.ref.addComponent(MoveComponent));
    // console.log(this.transform);
    // console.log(this.ref.components);
    // const move = this.ref.getComponents(MoveComponent);
    // console.log(move);
  }

  onUpdate() {
    // this.transform.translate(Vector3.zero, 0.5 * this.time.deltaTime);
  }

}