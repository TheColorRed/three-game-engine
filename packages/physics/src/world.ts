import { Debug, GameConfig, GameObject, Injectable, Injector, Quaternion, Three, Vector3 } from '@engine/core';
import Ammo from 'ammojs-typed';
import { filter, from, Observable, of, switchMap, tap, timer } from 'rxjs';
import { PhysicsMaterialOptions, RigidbodyOptions, RigidbodyOptions2D } from './decorators';
import { PHYSICS_MATERIAL, PHYSICS_RIGIDBODY } from './tokens';

@Injectable({ providedIn: 'game' })
export class World {

  readonly worldGravity = new Vector3(0, -9.81, 0);

  private readonly config = Injector.get(GameConfig)!;

  private _created = false;
  private Ammo!: typeof Ammo;
  private dynamicWorld!: Ammo.btDiscreteDynamicsWorld;
  bodies: [gameObject: GameObject, rigidbody: Ammo.btRigidBody][] = [];
  transform!: Ammo.btTransform;

  worldSteps$ = timer(1 / 60, 0)
    .pipe(
      tap(() => this.dynamicWorld.stepSimulation(1 / 60, 1)),
      // auditTime(50),
      switchMap(() => from(this.bodies).pipe(
        filter(([, body]) => body.isActive()),
        tap(([obj, body]) => {
          const state = body.getMotionState();
          if (state) {
            state.getWorldTransform(this.transform);
            // this.dynamicWorld.debugDrawObject(this.transform, body.getCollisionShape(), new this.Ammo.btVector3(255, 0, 0));
            const pos = this.transform.getOrigin();
            const rot = this.transform.getRotation();
            const px = pos.x(), py = pos.y(), pz = pos.z();
            const rx = rot.x(), ry = rot.y(), rz = rot.z(), rw = rot.w();
            obj.position = new Vector3(px, py, pz);
            obj.quaternion = new Quaternion(rx, ry, rz, rw);
          }
        })
      ))
    );

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
    const opts = Reflect.getMetadata(PHYSICS_RIGIDBODY, gameObject.instance.constructor) as RigidbodyOptions | RigidbodyOptions2D | undefined;
    if (typeof opts === 'undefined') throw new Error(`"${gameObject.name}" does not have a rigidbody.`);
    const mat = Reflect.getMetadata(PHYSICS_MATERIAL, opts.material || {}) as PhysicsMaterialOptions | undefined;
    const goPos = gameObject.position;
    const goQuat = gameObject.quaternion;

    // Create the transform for the rigidbody.
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.Ammo.btVector3(...goPos.toArray()));
    transform.setRotation(new this.Ammo.btQuaternion(...goQuat.toArray()));

    const motionState = new this.Ammo.btDefaultMotionState(transform);
    // Create the collider shape for the rigidbody.
    const shape = opts.twoDimensional ?
      this.createShape2D(opts as RigidbodyOptions2D, gameObject) :
      this.createShape(opts as RigidbodyOptions, gameObject);
    // Create the initial inertia for the rigidbody.
    const inertia = new this.Ammo.btVector3(1, 1, 1);

    // Create the rigidbody with the default settings.
    const info = new this.Ammo.btRigidBodyConstructionInfo(opts.mass ?? 1, motionState, shape, inertia);
    const body = new this.Ammo.btRigidBody(info);

    // Setup angular and linear constraints on the rigidbody.
    body.setAngularFactor(new this.Ammo.btVector3(...(opts.angularLock ?? Vector3.one).toArray()));
    body.setLinearFactor(new this.Ammo.btVector3(...(opts.linearLock ?? Vector3.one).toArray()));
    body.setSleepingThresholds(opts.sleepThreshold ?? 0.005, opts.sleepThreshold ?? 0.005);

    // Set the rigidbody's restitution (How much bounce should the rigidbody have).
    body.setRestitution(mat?.bounciness ?? 0.6);
    // Set the friction on the rigidbody.
    body.setFriction(mat?.friction ?? 0.6);
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

  createShape(options: RigidbodyOptions, gameObject: GameObject) {
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

  createShape2D(options: RigidbodyOptions2D, gameObject: GameObject) {
    let depth = 1;
    switch (options.shape?.type) {
      case 'box':
        var { width, height } = options.shape.size;
        if (gameObject.object3d instanceof Three.Sprite) {
          width = gameObject.object3d.scale.x * options.shape.size.width;
          height = gameObject.object3d.scale.y * options.shape.size.height;
        }
        return new this.Ammo.btBoxShape(new this.Ammo.btVector3(width * 0.5, height * 0.5, depth * 0.5));
      case 'circle':
        return new this.Ammo.btSphereShape(options.shape.radius);
      case 'capsule':
        var { radius, height } = options.shape.size;
        return new this.Ammo.btCapsuleShape(radius, height);
      default:
        return new this.Ammo.btEmptyShape();
    }
  }

  create() {
    if (this._created) return of();

    return new Observable(sub => {
      Debug.log('Creating Physics World...');
      Ammo().then(Ammo => {
        this.Ammo = Ammo;
        this._created = true;

        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
          dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
          overlappingPairCache = new Ammo.btDbvtBroadphase(),
          solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.dynamicWorld = new this.Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.dynamicWorld.setGravity(new this.Ammo.btVector3(...this.worldGravity.toArray()));

        this.transform = new this.Ammo.btTransform();

        this.worldSteps$.subscribe();
        sub.complete();
      });
    });
  }
}