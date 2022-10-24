import { Euler, GameObject, Injectable, Three, Vector2, Vector3 } from '@engine/core';
import { Body, Box, Circle, Vec2, World } from 'planck';
import { concatMap, filter, from, tap, timer, toArray } from 'rxjs';
import { Physics2DMaterialOptions } from '../decorators';
import { RigidbodyOptions2D } from '../decorators/rigidbody2d';
import { PHYSICS2D_MATERIAL, PHYSICS2D_RIGIDBODY } from '../tokens';

@Injectable({ providedIn: 'game' })
export class World2D {
  /**
   * The world gravity where `(x, y)` is the direction and z is the scale.
   */
  readonly worldGravity = new Vector3(0, -9.81, -0.001);

  world!: World;

  timeStep = 1 / 60;
  velocityIterations = 8;
  positionIterations = 6;

  bodies: [gameObject: GameObject, rigidbody: Body][] = [];

  #worldSteps$ = timer(0, this.timeStep)
    .pipe(
      tap(() => {
        this.world.step(this.timeStep, this.velocityIterations, this.positionIterations);
      }),
      concatMap(() => from(this.bodies)
        .pipe(
          filter(([, body]) => body.isAwake()),
          tap(([gameObject, body]) => {
            const { x, y } = body.getPosition();
            const v3 = new Three.Vector3(0, 0, body.getAngle());
            const euler = new Three.Euler().setFromVector3(v3);
            if (gameObject.name === 'Player') {
              // console.log(x, y);
            }
            gameObject.position = new Vector3(x, y, 0);
            gameObject.rotation = Euler.fromThree(euler);
          }),
          toArray()
        ))
    );

  add(gameObject: GameObject) {
    const opts = Reflect.getMetadata(PHYSICS2D_RIGIDBODY, gameObject.instance.constructor) as RigidbodyOptions2D | undefined;
    if (typeof opts === 'undefined') throw new Error(`"${gameObject.name}" does not have a rigidbody.`);
    const mat = Reflect.getMetadata(PHYSICS2D_MATERIAL, opts.material || {}) as Physics2DMaterialOptions | undefined;

    const pos = Vec2(gameObject.position.x, gameObject.position.y);

    const body = opts.isStatic ? this.world.createBody(pos) : this.world.createDynamicBody(pos);
    const shape = this.createShape2D(opts, gameObject);
    body.createFixture(shape, {
      density: opts.mass ?? 1,
      friction: mat?.friction ?? 0.6,
      restitution: mat?.bounciness ?? 0.6,
      isSensor: opts.isSensor ?? false
    });
    body.setAngle(gameObject.rotation.z);
    this.bodies.push([gameObject, body]);
  }

  remove(gameObject: GameObject) {
    const idx = this.bodies.findIndex(([go]) => go === gameObject);
    if (idx > -1) {
      const [, body] = this.bodies[idx];
      this.world.destroyBody(body);
      this.bodies.splice(idx, 1);
    }
  }

  create() {
    this.world = new World(Vec2(this.worldGravity.x, this.worldGravity.y));

    this.#worldSteps$.subscribe();

    // this.engine = Engine.create({
    //   // enableSleeping: true,
    //   // velocityIterations: 10,
    //   // positionIterations: 1000,
    //   // constraintIterations: 10,
    //   gravity: { x: this.worldGravity.x, y: this.worldGravity.y, scale: this.worldGravity.z }
    // });
    // this.world = this.engine.world;
    // this.runner = Runner.create({ isFixed: true });

    // // this.addRenderer();

    // Runner.run(this.runner, this.engine);

    // this.worldSteps$.subscribe();
  }

  applyForce(gameObject: GameObject, force: Vector2) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.applyForceToCenter(Vec2(...force.toArray()));
    }
  }

  applyImpulse(gameObject: GameObject, force: Vector2) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.applyLinearImpulse(Vec2(...force.toArray()), Vec2(0, 0));
    }
  }

  applyTorque(gameObject: GameObject, force: number) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.applyTorque(force);
    }
  }

  applyTorqueImpulse(gameObject: GameObject, force: number) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.applyAngularImpulse(force);
    }
  }

  setVelocity(gameObject: GameObject, velocity: Vector2) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.setLinearVelocity(Vec2(...velocity.toArray()));
    }
  }

  setAngularVelocity(gameObject: GameObject, velocity: number) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.setAngularVelocity(velocity);
    }
  }

  createShape2D(options: RigidbodyOptions2D, gameObject: GameObject) {
    const { x, y } = gameObject.position;
    var width = 0, height = 0;
    switch (options.shape?.type) {
      case 'box':
        // var { width, height } = options.shape.size;
        width = (gameObject.object3d?.scale.x ?? 1) * options.shape.size.width;
        height = (gameObject.object3d?.scale.y ?? 1) * options.shape.size.height;
        return Box(width * 0.5, height * 0.5);
      // return new this.Ammo.btBoxShape(new this.Ammo.btVector3(width * 0.5, height * 0.5, depth * 0.5));
      case 'circle':
        // var radius = options.shape.radius;
        const radius = (gameObject.object3d?.scale.x ?? 1) * options.shape.radius;
        return Circle(Vec2(0, 0), radius * 0.5);
      // return new this.Ammo.btSphereShape(radius * 0.5);
      case 'capsule':
        var { width, height } = options.shape.size;
        return Box(width, height);
      // return Bodies.rectangle(x, y, width, height, { chamfer: { radius: 1000 } });
      // return new this.Ammo.btCapsuleShape(radius, height);
      default:
        return Circle(Vec2(x, y), 0);
      // return new this.Ammo.btEmptyShape();
    }
  }
}