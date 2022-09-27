import { Debug, Euler, GameObject, Injectable, Three, Vector3 } from '@engine/core';
import Ammo from 'ammojs-typed';
import { from, Observable, of, switchMap, tap, timer } from 'rxjs';
import { PhysicsMaterialOptions, RigidbodyOptions } from './decorators';
import { PHYSICS_MATERIAL, PHYSICS_RIGIDBODY } from './tokens';

@Injectable({ providedIn: 'game' })
export class World {

  readonly worldGravity = new Vector3(0, -9.81, 0);

  private _worldCreated = false;
  private Ammo!: typeof Ammo;
  private dynamicWorld!: Ammo.btDiscreteDynamicsWorld;
  bodies: [gameObject: GameObject, rigidbody: Ammo.btRigidBody][] = [];

  globalTransform!: Ammo.btTransform;

  worldSteps$ = timer(1 / 60, 0)
    .pipe(
      tap(() => this.dynamicWorld.stepSimulation(1 / 60, 10)),
      // auditTime(50),
      switchMap(() => from(this.bodies).pipe(
        tap(([obj, body]) => {
          const state = body.getMotionState();
          if (state) {
            state.getWorldTransform(this.globalTransform);
            const pos = this.globalTransform.getOrigin();
            const rot = this.globalTransform.getRotation();
            const px = pos.x(), py = pos.y(), pz = pos.z();
            const rx = rot.x(), ry = rot.y(), rz = rot.z(), rw = rot.w();
            // console.log(rx, ry, rz, rw);
            obj.position = new Vector3(px, py, pz);
            obj.rotation = Euler.fromThree(
              new Three.Euler().setFromQuaternion(new Three.Quaternion(rx, ry, rz, rw))
            );
          }
        })
      ))
    );

  get created() {
    return this._worldCreated;
  }

  /**
   * Removes a game object from the physics world.
   * @param gameObject The game object to remove.
   */
  remove(gameObject: GameObject) {
    const idx = this.bodies.findIndex(([go]) => go === gameObject);
    if (idx > -1) {
      const body = this.bodies[idx][1];
      this.dynamicWorld.removeRigidBody(body);
      this.bodies.splice(idx, 1);
    }
  }

  /**
   * Adds a game object into the physics world.
   * @param gameObject The game object to add.
   */
  add(gameObject: GameObject) {
    const opts = Reflect.getMetadata(PHYSICS_RIGIDBODY, gameObject.instance.constructor) as RigidbodyOptions | undefined;
    if (typeof opts === 'undefined') throw new Error(`"${gameObject.name}" does not have a rigidbody.`);
    const mat = Reflect.getMetadata(PHYSICS_MATERIAL, opts.material || {}) as PhysicsMaterialOptions | undefined;
    const goPos = gameObject.position;
    const goQuat = gameObject.quaternion;

    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.Ammo.btVector3(...goPos.toArray()));
    transform.setRotation(new this.Ammo.btQuaternion(...goQuat.toArray()));

    const motionState = new this.Ammo.btDefaultMotionState(transform);
    const shape = this.createShape(opts);
    const inertia = new this.Ammo.btVector3(0, 0, 0);

    const info = new this.Ammo.btRigidBodyConstructionInfo(opts.mass ?? 1, motionState, shape, inertia);
    const body = new this.Ammo.btRigidBody(info);

    body.setAngularFactor(new this.Ammo.btVector3(...(opts.angularLock || Vector3.one).toArray()));
    body.setLinearFactor(new this.Ammo.btVector3(...(opts.linearLock || Vector3.one).toArray()));

    body.setRestitution(mat?.bounciness ?? 1);
    body.setFriction(mat?.friction ?? 1);
    if (opts.gravity instanceof Vector3) {
      const gravity = new this.Ammo.btVector3(...opts.gravity.toArray());
      body.setGravity(gravity);
    }

    this.dynamicWorld.addRigidBody(body);

    this.bodies.push([gameObject, body]);
  }

  applyForce(gameObject: GameObject, force: Vector3) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.activate(true);
      body.applyCentralLocalForce(new this.Ammo.btVector3(...force.toArray()));
    }
  }

  applyImpulse(gameObject: GameObject, force: Vector3) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.activate(true);
      body.applyCentralImpulse(new this.Ammo.btVector3(...force.toArray()));
    }
  }

  setVelocity(gameObject: GameObject, velocity: Vector3) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.activate(true);
      body.setLinearVelocity(new this.Ammo.btVector3(...velocity.toArray()));
    }
  }

  setAngularVelocity(gameObject: GameObject, velocity: Vector3) {
    const [go, body] = this.bodies.find(i => i[0] === gameObject) ?? [];
    if (go && body) {
      body.activate(true);
      body.setAngularVelocity(new this.Ammo.btVector3(...velocity.toArray()));
    }
  }

  createShape(options: RigidbodyOptions) {
    switch (options.shape?.type) {
      case 'sphere':
        return new this.Ammo.btSphereShape(options.shape.radius);
      case 'cube':
        var { width, height, depth } = options.shape.size;
        return new this.Ammo.btBoxShape(new this.Ammo.btVector3(width * 0.5, height * 0.5, depth * 0.5));
      case 'cone':
        var { radius, height } = options.shape.size;
        return new this.Ammo.btConeShape(radius, height);
      case 'convex':
        return new this.Ammo.btConvexShape();
      case 'concave':
        return new this.Ammo.btConcaveShape();
      case 'capsule':
        var { radius, height } = options.shape.size;
        return new this.Ammo.btCapsuleShape(radius, height);
      case 'none': // Use the default shape
      default:
        return new this.Ammo.btEmptyShape();
    }
  }

  create() {
    if (this._worldCreated) return of();

    return new Observable(sub => {
      Debug.log('Creating Physics World...');
      Ammo().then(Ammo => {
        this.Ammo = Ammo;
        this._worldCreated = true;

        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
          dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
          overlappingPairCache = new Ammo.btDbvtBroadphase(),
          solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.dynamicWorld = new this.Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.dynamicWorld.setGravity(new this.Ammo.btVector3(...this.worldGravity.toArray()));

        this.globalTransform = new this.Ammo.btTransform();

        this.worldSteps$.subscribe();
        sub.complete();
      });
    });
  }
}